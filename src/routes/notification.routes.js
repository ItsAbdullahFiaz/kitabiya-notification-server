const express = require('express');
const NotificationController = require('../controllers/notification.controller');
const { validateNotification, validateBroadcast } = require('../middleware/validation.middleware');
const router = express.Router();

router.post('/send', validateNotification, NotificationController.sendNotification);

router.post('/broadcast', validateBroadcast, NotificationController.broadcastToAll);

router.get('/broadcasts', NotificationController.getBroadcastHistory);

module.exports = router;