const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Notification routes working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;