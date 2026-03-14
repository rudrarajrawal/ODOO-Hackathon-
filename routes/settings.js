const express = require('express');
const router = express.Router();

// Mock MVP Settings system stored simply in-memory to simulate db storage
let config = {
    lowStockThreshold: 10,
    systemName: "INVENTRIX",
    themePrimaryColor: "#6CFF6C",
    adminEmail: "admin@inventory.com",
    emailNotificationsActive: true
};

// Get settings
router.get('/', (req, res) => {
    res.json(config);
});

// Update settings
router.put('/', (req, res) => {
    const data = req.body;
    
    // Safely update allowed parameters
    if(data.lowStockThreshold !== undefined) config.lowStockThreshold = parseInt(data.lowStockThreshold);
    if(data.systemName !== undefined) config.systemName = data.systemName;
    if(data.adminEmail !== undefined) config.adminEmail = data.adminEmail;
    if(data.emailNotificationsActive !== undefined) config.emailNotificationsActive = !!data.emailNotificationsActive;
    
    res.json({ success: true, message: 'Configuration parameters updated successfully', config });
});

module.exports = router;
