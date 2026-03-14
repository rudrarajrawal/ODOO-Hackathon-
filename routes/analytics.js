const express = require('express');
const router = express.Router();

// Get Detailed Analytics
// Returns: Revenue data over time, Top selling items, and Supplier share
router.get('/advanced', (req, res) => {
    let analyticsData = {
        revenueByDate: { labels: [], data: [] },
        topProducts: { labels: [], data: [] },
        supplierShare: { labels: [], data: [] }
    };
    
    let pending = 3;
    const checkDone = () => {
        pending--;
        if (pending === 0) res.json(analyticsData);
    };

    // 1. Revenue over time (sales volume * price)
    // For MVP, we will simplify: quantity sold * current product price (historic price not tracked yet)
    const revenueQuery = `
        SELECT o.date, SUM(o.quantity * p.price) as revenue
        FROM orders o
        JOIN products p ON o.product_id = p.id
        GROUP BY o.date
        ORDER BY o.date DESC
        LIMIT 10
    `;
    req.db.all(revenueQuery, [], (err, rows) => {
        if (!err && rows) {
            rows.reverse().forEach(r => {
                analyticsData.revenueByDate.labels.push(r.date);
                analyticsData.revenueByDate.data.push(r.revenue || 0);
            });
        }
        checkDone();
    });

    // 2. Top Selling Products (by quantity)
    const topProdQuery = `
        SELECT p.name, SUM(o.quantity) as total_sold
        FROM orders o
        JOIN products p ON o.product_id = p.id
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
    `;
    req.db.all(topProdQuery, [], (err, rows) => {
        if (!err && rows) {
            rows.forEach(r => {
                analyticsData.topProducts.labels.push(r.name);
                analyticsData.topProducts.data.push(r.total_sold || 0);
            });
        }
        checkDone();
    });

    // 3. Supplier Product Distribution (how much inventory value per supplier)
    const supplierShareQuery = `
        SELECT sp.name as supplier_name, SUM(p.stock * p.price) as inventory_value
        FROM products p
        JOIN people sp ON p.supplier_id = sp.id
        GROUP BY sp.id
    `;
    req.db.all(supplierShareQuery, [], (err, rows) => {
        if (!err && rows) {
            rows.forEach(r => {
                analyticsData.supplierShare.labels.push(r.supplier_name || 'Unknown');
                analyticsData.supplierShare.data.push(r.inventory_value || 0);
            });
        }
        checkDone();
    });
});

module.exports = router;
