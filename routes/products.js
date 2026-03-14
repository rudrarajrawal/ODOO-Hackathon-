const express = require('express');
const router = express.Router();
const ProductModel = require('../models/productModel');
const { logEvent } = require('./logs');

// GET all products
router.get('/', (req, res) => {
    ProductModel.getAll(req.db, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET single product
router.get('/:id', (req, res) => {
    ProductModel.getById(req.db, req.params.id, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

// POST new product
router.post('/', (req, res) => {
    ProductModel.create(req.db, req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        logEvent(req.db, 'PRODUCT_CREATED', `New product added: ${req.body.name} (ID: ${id})`);
        res.json({ success: true, id });
    });
});

// PUT (update) existing product
router.put('/:id', (req, res) => {
    ProductModel.update(req.db, req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logEvent(req.db, 'PRODUCT_UPDATED', `Product ID ${req.params.id} modified: ${req.body.name}`);
        res.json({ success: true });
    });
});

// DELETE a product
router.delete('/:id', (req, res) => {
    ProductModel.delete(req.db, req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logEvent(req.db, 'PRODUCT_DELETED', `Product ID ${req.params.id} permanently removed`);
        res.json({ success: true });
    });
});

module.exports = router;
