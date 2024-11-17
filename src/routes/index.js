const express = require('express');
const notificationRoutes = require('./notification.routes');
const logger = require('../utils/logger');

const router = express.Router();

// Log all API requests
router.use(logger.httpRequest);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API version prefix
router.use('/v1/notifications', notificationRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist'
    });
});

module.exports = router;
