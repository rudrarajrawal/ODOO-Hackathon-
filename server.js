const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Connect to Database
const dbPath = path.join(__dirname, 'database', 'inventory.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        
        // Initialize users table and default admin for auth
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            phone TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                db.get('SELECT * FROM users WHERE email = ?', ['admin@inventory.com'], (err, row) => {
                    if (!row) {
                        db.run('INSERT INTO users (email, password, phone) VALUES (?, ?, ?)', ['admin@inventory.com', '123456', '+1234567890']);
                        console.log('Default admin@inventory.com user seeded with phone +1234567890.');
                    }
                });
            } else {
                console.error("Error creating users table", err);
            }
        });

        // Initialize verification_codes table
        db.run(`CREATE TABLE IF NOT EXISTS verification_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT,
            code TEXT,
            expires_at DATETIME
        )`, (err) => {
            if (err) console.error("Error creating verification_codes table", err);
        });
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// Make DB accessible to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Root path redirect
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/people', require('./routes/people'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/logs', require('./routes/logs'));

// Dashboard metrics API
app.get('/api/dashboard/metrics', (req, res) => {
    const queries = {
        products: 'SELECT COUNT(*) as count FROM products',
        suppliers: 'SELECT COUNT(*) as count FROM people WHERE type = "Supplier"',
        orders: 'SELECT COUNT(*) as count FROM orders',
        lowStock: 'SELECT COUNT(*) as count FROM products WHERE stock <= 10'
    };
    
    let metrics = {};
    let pending = 4;

    const checkDone = () => {
        pending--;
        if (pending === 0) res.json(metrics);
    };

    req.db.get(queries.products, [], (err, row) => { metrics.totalProducts = row ? row.count : 0; checkDone(); });
    req.db.get(queries.suppliers, [], (err, row) => { metrics.totalSuppliers = row ? row.count : 0; checkDone(); });
    req.db.get(queries.orders, [], (err, row) => { metrics.totalOrders = row ? row.count : 0; checkDone(); });
    req.db.get(queries.lowStock, [], (err, row) => { metrics.lowStockItems = row ? row.count : 0; checkDone(); });
});

// Dashboard charts API
app.get('/api/dashboard/charts', (req, res) => {
    let chartData = {
        inventoryByCategory: { labels: [], data: [] },
        recentOrders: { labels: [], data: [] }
    };
    
    let pending = 2;
    const checkDone = () => {
        pending--;
        if (pending === 0) res.json(chartData);
    };

    // 1. Inventory by Category
    req.db.all('SELECT category, SUM(stock) as total_stock FROM products GROUP BY category', [], (err, rows) => {
        if (!err && rows) {
            rows.forEach(r => {
                chartData.inventoryByCategory.labels.push(r.category || 'Uncategorized');
                chartData.inventoryByCategory.data.push(r.total_stock || 0);
            });
        }
        checkDone();
    });

    // 2. Orders over time (simplified for MVP: just getting last 5 dates with orders)
    req.db.all('SELECT date, SUM(quantity) as total_qty FROM orders GROUP BY date ORDER BY date DESC LIMIT 7', [], (err, rows) => {
        if (!err && rows) {
            // Reverse to show chronological order
            rows.reverse().forEach(r => {
                chartData.recentOrders.labels.push(r.date);
                chartData.recentOrders.data.push(r.total_qty || 0);
            });
        }
        checkDone();
    });
});

// Startup Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
