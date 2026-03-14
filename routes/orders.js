const express = require('express');
const router = express.Router();
const OrderModel = require('../models/orderModel');
const { logEvent } = require('./logs');

// GET all orders
router.get('/', (req, res) => {
    OrderModel.getAll(req.db, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST new order (includes stock reduction)
router.post('/', (req, res) => {
    OrderModel.create(req.db, req.body, (err, id) => {
        if (err) {
            // Check if error is due to stock
            if (err.message === 'Insufficient stock' || err.message === 'Product not found') {
                logEvent(req.db, 'ORDER_FAILED', `Failed order attempt (Reason: ${err.message}) for Product ID ${req.body.product_id}`);
                return res.status(400).json({ error: err.message });
            }
            return res.status(500).json({ error: err.message });
        }
        logEvent(req.db, 'ORDER_COMPLETED', `New order created: ID ORD-${id.toString().padStart(4, '0')} for ${req.body.quantity} units`);
        res.status(201).json({ id, success: true });
    });
});

// Update order
router.put('/:id', (req, res) => {
    OrderModel.update(req.db, req.params.id, req.body, (err) => {
        if (err) {
            if (err.message === 'Insufficient stock for update' || err.message === 'Order not found') {
                return res.status(400).json({ error: err.message });
            }
            return res.status(500).json({ error: err.message });
        }
        logEvent(req.db, 'ORDER_UPDATED', `Order ID ORD-${req.params.id.toString().padStart(4, '0')} updated`);
        res.json({ success: true });
    });
});

// Delete order
router.delete('/:id', (req, res) => {
    OrderModel.delete(req.db, req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logEvent(req.db, 'ORDER_CANCELLED', `Order ID ORD-${req.params.id.toString().padStart(4, '0')} cancelled & stock restored`);
        res.json({ success: true });
    });
});

module.exports = router;
