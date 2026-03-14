const express = require('express');
const router = express.Router();

// Get all logs (ordered by timestamp)
router.get('/', (req, res) => {
    req.db.all('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Helper for internal logging (not a route)
function logEvent(db, action, details, user = 'admin') {
    db.run('INSERT INTO logs (action, details, user) VALUES (?, ?, ?)', [action, details, user], (err) => {
        if (err) console.error('Internal Logging Error:', err.message);
    });
}

module.exports = router;
module.exports.logEvent = logEvent;
