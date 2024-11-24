const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');
const Broadcast = require('../models/broadcast.model');

class NotificationController {
    static async sendNotification(req, res, next) {
        try {
            const { token, title, body, data } = req.body;
            logger.info('Received notification request', { token, title });

            if (!token) {
                logger.warn('No token provided');
                return res.status(400).json({ error: 'FCM token is required' });
            }

            const response = await NotificationService.sendNotification(token, title, body, data);
            logger.info('Successfully sent notification', { messageId: response });

            return res.status(200).json({ success: true, messageId: response });
        } catch (error) {
            if (error.code === 'messaging/registration-token-not-registered') {
                logger.warn('Invalid token', { token });
                return res.status(404).json({
                    error: 'FCM token is invalid or expired',
                    code: error.code
                });
            }
            next(error);
        }
    }

    static async broadcastToAll(req, res) {
        try {
            const { title, body, data } = req.body;
            const adminId = req.user?.id || 'system'; // Get from auth middleware

            // Send broadcast
            const result = await NotificationService.broadcastToAll(title, body, data);

            // Save broadcast to database
            await Broadcast.create({
                title,
                body,
                data,
                sentBy: adminId,
                messageId: result.messageId,
                status: 'sent'
            });

            return res.status(200).json({
                success: true,
                message: 'Broadcast sent successfully',
                messageId: result.messageId
            });
        } catch (error) {
            logger.error('Error in broadcastToAll:', error);
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                message: error.message
            });
        }
    }

    static async getBroadcastHistory(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const broadcasts = await Broadcast.find()
                .sort({ createdAt: -1 }) // Latest first
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Broadcast.countDocuments();

            return res.status(200).json({
                success: true,
                data: {
                    broadcasts,
                    pagination: {
                        current: page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                },
                message: 'Broadcast history retrieved successfully'
            });
        } catch (error) {
            logger.error('Error getting broadcast history:', error);
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                message: error.message
            });
        }
    }
}

module.exports = NotificationController;