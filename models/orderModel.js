class OrderModel {
  static getAll(db, callback) {
    db.all(`
      SELECT o.*, p.name as product_name, c.name as customer_name, (o.quantity * p.price) as total
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN people c ON o.customer_id = c.id
      ORDER BY o.date DESC
    `, callback);
  }

  static create(db, data, callback) {
    const { product_id, customer_id, quantity, status, date } = data;
    
    db.serialize(() => {
      // 1. Check current stock
      db.get('SELECT stock FROM products WHERE id = ?', [product_id], (err, product) => {
        if (err) return callback(err);
        if (!product) return callback(new Error("Product not found"));
        
        if (product.stock < quantity) {
          return callback(new Error("Insufficient stock"));
        }

        // 2. Insert the order
        const sqlInsert = 'INSERT INTO orders (product_id, customer_id, quantity, status, date) VALUES (?, ?, ?, ?, ?)';
        db.run(sqlInsert, [product_id, customer_id, quantity, status, date], function(err) {
          if (err) return callback(err);
          const orderId = this.lastID;

          // 3. Reduce stock
          const sqlUpdate = 'UPDATE products SET stock = stock - ? WHERE id = ?';
          db.run(sqlUpdate, [quantity, product_id], (err) => {
            if (err) return callback(err);
            callback(null, orderId);
          });
        });
      });
    });
  }

  static update(db, id, data, callback) {
    const { product_id, customer_id, quantity, status, date } = data;
    
    db.serialize(() => {
      // 1. Get old order to calculate stock difference
      db.get('SELECT quantity, product_id FROM orders WHERE id = ?', [id], (err, oldOrder) => {
        if (err) return callback(err);
        if (!oldOrder) return callback(new Error("Order not found"));

        const qtyDiff = quantity - oldOrder.quantity;

        // 2. Check stock if quantity increases
        if (qtyDiff > 0) {
          db.get('SELECT stock FROM products WHERE id = ?', [product_id], (err, product) => {
            if (err) return callback(err);
            if (product.stock < qtyDiff) return callback(new Error("Insufficient stock for update"));

            this._performUpdate(db, id, data, qtyDiff, callback);
          });
        } else {
          this._performUpdate(db, id, data, qtyDiff, callback);
        }
      });
    });
  }

  static _performUpdate(db, id, data, qtyDiff, callback) {
    const { product_id, customer_id, quantity, status, date } = data;
    const sqlUpdateOrder = 'UPDATE orders SET product_id = ?, customer_id = ?, quantity = ?, status = ?, date = ? WHERE id = ?';
    
    db.run(sqlUpdateOrder, [product_id, customer_id, quantity, status, date, id], (err) => {
      if (err) return callback(err);

      const sqlUpdateStock = 'UPDATE products SET stock = stock - ? WHERE id = ?';
      db.run(sqlUpdateStock, [qtyDiff, product_id], callback);
    });
  }

  static delete(db, id, callback) {
    db.serialize(() => {
      // 1. Get order details to restore stock
      db.get('SELECT product_id, quantity FROM orders WHERE id = ?', [id], (err, order) => {
        if (err) return callback(err);
        if (!order) return callback(new Error("Order not found"));

        // 2. Delete the order
        db.run('DELETE FROM orders WHERE id = ?', [id], (err) => {
          if (err) return callback(err);

          // 3. Restore stock
          db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [order.quantity, order.product_id], callback);
        });
      });
    });
  }
}

module.exports = OrderModel;
