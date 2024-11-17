const express = require('express');
const NotificationController = require('../controllers/notification.controller');
const { validateNotification } = require('../middleware/validation.middleware');
const router = express.Router();

router.post('/send', validateNotification, NotificationController.sendNotification);

module.exports = router;