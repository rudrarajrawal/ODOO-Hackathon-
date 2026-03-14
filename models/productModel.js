class ProductModel {
  static getAll(db, callback) {
    db.all(`
      SELECT p.*, s.name as supplier_name 
      FROM products p 
      LEFT JOIN people s ON p.supplier_id = s.id
    `, callback);
  }

  static getById(db, id, callback) {
    db.get('SELECT * FROM products WHERE id = ?', [id], callback);
  }

  static create(db, data, callback) {
    const sql = 'INSERT INTO products (name, category, price, stock, supplier_id) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [data.name, data.category, data.price, data.stock, data.supplier_id], function(err) {
      callback(err, this ? this.lastID : null);
    });
  }

  static update(db, id, data, callback) {
    const sql = 'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, supplier_id = ? WHERE id = ?';
    db.run(sql, [data.name, data.category, data.price, data.stock, data.supplier_id, id], callback);
  }

  static delete(db, id, callback) {
    db.run('DELETE FROM products WHERE id = ?', [id], callback);
  }
}

module.exports = ProductModel;
