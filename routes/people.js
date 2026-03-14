const express = require('express');
const router = express.Router();
const PeopleModel = require('../models/peopleModel');
const { logEvent } = require('./logs');

// GET all people
router.get('/', (req, res) => {
    PeopleModel.getAll(req.db, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET single person
router.get('/:id', (req, res) => {
    PeopleModel.getById(req.db, req.params.id, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

// POST new person
router.post('/', (req, res) => {
    PeopleModel.create(req.db, req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        logEvent(req.db, 'CONTACT_CREATED', `New ${req.body.type} added: ${req.body.name}`);
        res.json({ success: true, id });
    });
});

// PUT (update) existing person
router.put('/:id', (req, res) => {
    PeopleModel.update(req.db, req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logEvent(req.db, 'CONTACT_UPDATED', `Contact ID ${req.params.id} updated: ${req.body.name}`);
        res.json({ success: true });
    });
});

// DELETE a person
router.delete('/:id', (req, res) => {
    PeopleModel.delete(req.db, req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logEvent(req.db, 'CONTACT_DELETED', `Contact ID ${req.params.id} removed from directory`);
        res.json({ success: true });
    });
});

module.exports = router;
