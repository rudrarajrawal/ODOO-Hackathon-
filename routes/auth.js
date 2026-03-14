const express = require('express');
const router = express.Router();

// Register Endpoint
router.post('/register', (req, res) => {
    const { email, password } = req.body;
    
    // Check if user exists
    req.db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        if (user) return res.status(400).json({ success: false, message: 'Email already registered' });
        
        // Insert new user
        req.db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], function(err) {
            if (err) return res.status(500).json({ success: false, message: 'Database error during registration' });
            res.json({ success: true, message: 'Registration successful' });
        });
    });
});

// Login Endpoint
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    req.db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        
        if (user) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

module.exports = router;
