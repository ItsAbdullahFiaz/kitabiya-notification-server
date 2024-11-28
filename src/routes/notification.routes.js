const express = require('express');
const NotificationController = require('../controllers/notification.controller');
const { validateNotification, validateBroadcast } = require('../middleware/validation.middleware');
const router = express.Router();

// Public routes (require only auth)
router.post('/', validateNotification, NotificationController.sendNotification);
router.get('/', NotificationController.getBroadcastHistory);

// Admin-only route
router.post('/', validateBroadcast, NotificationController.broadcastToAll);

module.exports = router;