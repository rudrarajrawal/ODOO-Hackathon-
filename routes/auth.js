const express = require('express');
const router = express.Router();

// Register Endpoint
router.post('/register', (req, res) => {
    const { email, password, phone } = req.body;
    
    // Check if user exists
    req.db.get('SELECT * FROM users WHERE email = ? OR phone = ?', [email, phone], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        if (user) return res.status(400).json({ success: false, message: 'Email or Phone already registered' });
        
        // Insert new user
        req.db.run('INSERT INTO users (email, password, phone) VALUES (?, ?, ?)', [email, password, phone], function(err) {
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

// Send SMS OTP (Mock)
router.post('/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes expiry

    // Save to DB
    req.db.run('INSERT INTO verification_codes (phone, code, expires_at) VALUES (?, ?, ?)', [phone, code, expiresAt.toISOString()], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        
        console.log(`[MOCK SMS] Sent to ${phone}: ${code}`);
        res.json({ success: true, message: 'OTP sent successfully (check server console)' });
    });
});

// Phone Login/Signup Endpoint
router.post('/phone-login', (req, res) => {
    const { phone, code } = req.body;
    
    if (!phone || !code) return res.status(400).json({ success: false, message: 'Phone and code are required' });

    // Verify OTP
    req.db.get('SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND expires_at > ?', 
        [phone, code, new Date().toISOString()], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        if (!row) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

        // OTP Valid - Proceed with login/registration
        req.db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, user) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            
            // Delete code after use
            req.db.run('DELETE FROM verification_codes WHERE id = ?', [row.id]);

            if (user) {
                res.json({ success: true, message: 'Login successful', email: user.email });
            } else {
                const placeholderEmail = `user_${Date.now()}@phone.auth`;
                req.db.run('INSERT INTO users (email, phone) VALUES (?, ?)', [placeholderEmail, phone], function(err) {
                    if (err) return res.status(500).json({ success: false, message: 'Database error during phone registration' });
                    res.json({ success: true, message: 'Registration successful', email: placeholderEmail });
                });
            }
        });
    });
});

// Reset Password via Phone Endpoint
router.post('/reset-password-phone', (req, res) => {
    const { phone, code, newPassword } = req.body;

    if (!phone || !code || !newPassword) {
        return res.status(400).json({ success: false, message: 'Phone, code, and new password are required' });
    }

    // Verify OTP
    req.db.get('SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND expires_at > ?', 
        [phone, code, new Date().toISOString()], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        if (!row) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

        // Update password
        req.db.run('UPDATE users SET password = ? WHERE phone = ?', [newPassword, phone], function(err) {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            
            // Delete code after use
            req.db.run('DELETE FROM verification_codes WHERE id = ?', [row.id]);

            if (this.changes > 0) {
                res.json({ success: true, message: 'Password reset successful' });
            } else {
                res.status(404).json({ success: false, message: 'User not found with this phone number' });
            }
        });
    });
});

module.exports = router;
