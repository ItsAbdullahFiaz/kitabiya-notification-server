const express = require('express');
const NotificationController = require('../controllers/notification.controller');
const { validateNotification, validateBroadcast } = require('../middleware/validation.middleware');
const router = express.Router();

/**
 * @swagger
 * /api/v1/notifications/send:
 *   post:
 *     summary: Send notification to a specific device
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - title
 *               - body
 *             properties:
 *               token:
 *                 type: string
 *                 description: Device FCM token
 *               title:
 *                 type: string
 *                 description: Notification title
 *               body:
 *                 type: string
 *                 description: Notification message
 *               data:
 *                 type: object
 *                 description: Additional data to send with notification
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Invalid input or validation error
 *       500:
 *         description: Server error
 */
router.post('/send', validateNotification, NotificationController.sendNotification);

/**
 * @swagger
 * /api/v1/notifications/broadcast:
 *   post:
 *     summary: Broadcast notification to all devices
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notification title
 *               body:
 *                 type: string
 *                 description: Notification message
 *               data:
 *                 type: object
 *                 description: Additional data to send with notification
 *     responses:
 *       200:
 *         description: Broadcast sent successfully
 *       400:
 *         description: Invalid input or validation error
 *       500:
 *         description: Server error
 */
router.post('/broadcast', validateBroadcast, NotificationController.broadcastToAll);

module.exports = router;