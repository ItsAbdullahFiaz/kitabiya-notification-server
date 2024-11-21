const express = require('express');
const NotificationController = require('../controllers/notification.controller');
const { validateNotification, validateBroadcast } = require('../middleware/validation.middleware');
const router = express.Router();

// Keep existing route
router.post('/send', validateNotification, NotificationController.sendNotification);

// Add new broadcast route
router.post('/broadcast', validateBroadcast, NotificationController.broadcastToAll);

module.exports = router;