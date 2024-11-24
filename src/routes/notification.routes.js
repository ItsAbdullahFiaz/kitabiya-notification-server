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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification sent successfully
 *                 messageId:
 *                   type: string
 *                   example: "projects/myapp/messages/1234567890"
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
 *     summary: Broadcast notification to all subscribed devices
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
 *                 example: "Special Offer!"
 *               body:
 *                 type: string
 *                 description: Notification message
 *                 example: "50% off on all items today!"
 *               data:
 *                 type: object
 *                 description: Additional data to send with notification
 *                 example:
 *                   type: "promotion"
 *                   link: "/offers"
 *     responses:
 *       200:
 *         description: Broadcast sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Broadcast sent successfully
 *                 messageId:
 *                   type: string
 *                   example: "projects/myapp/messages/1234567890"
 *                 timestamp:
 *                   type: string
 *                   example: "2024-01-20T12:00:00.000Z"
 *       400:
 *         description: Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Title and body are required!
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *                 timestamp:
 *                   type: string
 *                   example: "2024-01-20T12:00:00.000Z"
 */
router.post('/broadcast', validateBroadcast, NotificationController.broadcastToAll);

/**
 * @swagger
 * /api/v1/notifications/broadcasts:
 *   get:
 *     summary: Get broadcast notification history
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Broadcast history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     broadcasts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           body:
 *                             type: string
 *                           data:
 *                             type: object
 *                           sentBy:
 *                             type: string
 *                           messageId:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [sent, failed]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       500:
 *         description: Server error
 */
router.get('/broadcasts', NotificationController.getBroadcastHistory);

module.exports = router;