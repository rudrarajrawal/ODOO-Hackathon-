const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'inventory.db');

// Delete existing DB for a fresh start (optional, but good for reliable hackathon init)
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    db.serialize(() => {
      // Create Users Table
      db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
      )`);

      // Create Products Table
      db.run(`CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        category TEXT,
        price REAL,
        stock INTEGER,
        supplier_id INTEGER
      )`);

      // Create People Table
      db.run(`CREATE TABLE people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT, -- 'Supplier' or 'Customer'
        phone TEXT,
        email TEXT,
        address TEXT
      )`);

      // Create Orders Table
      db.run(`CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        customer_id INTEGER,
        quantity INTEGER,
        status TEXT, -- 'Pending', 'Delivered'
        date TEXT
      )`);

      // Insert Default Admin User
      db.run(`INSERT INTO users (email, password) VALUES ('admin@inventory.com', '123456')`);

      // Insert Initial Sample People
      const insertPerson = db.prepare(`INSERT INTO people (name, type, phone, email, address) VALUES (?, ?, ?, ?, ?)`);
      insertPerson.run('Tech Supplies Inc.', 'Supplier', '555-0100', 'contact@techsupplies.com', '123 Tech Park');
      insertPerson.run('Globex Corp', 'Supplier', '555-0101', 'sales@globex.com', '456 Globex Way');
      insertPerson.run('John Doe', 'Customer', '555-0200', 'john@example.com', '789 Main St');
      insertPerson.finalize();

      // Insert Initial Sample Products
      const insertProduct = db.prepare(`INSERT INTO products (name, category, price, stock, supplier_id) VALUES (?, ?, ?, ?, ?)`);
      insertProduct.run('Wireless Mouse', 'Electronics', 25.99, 150, 1);
      insertProduct.run('Mechanical Keyboard', 'Electronics', 89.99, 45, 1);
      insertProduct.run('Ergonomic Chair', 'Furniture', 199.99, 8, 2); // Low stock example (< 10)
      insertProduct.finalize();

      console.log('Database initialized with sample data.');
    });
  }
});
