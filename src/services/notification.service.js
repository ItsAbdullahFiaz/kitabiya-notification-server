const admin = require('firebase-admin');
const logger = require('../utils/logger');

class NotificationService {
    static async sendNotification(token, title, body, data) {
        const message = {
            token,
            notification: { title, body },
            data: Object.fromEntries(
                Object.entries(data || {}).map(([key, value]) => [key, String(value)])
            ),
            android: {
                priority: 'high',
                notification: {
                    channelId: 'default',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                },
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                        badge: 1,
                        sound: 'default',
                    },
                },
            },
        };

        return admin.messaging().send(message);
    }

    static async broadcastToAll(title, body, data) {
        try {
            logger.info('Attempting to send broadcast notification', { title, body });

            // Check if Firebase is initialized
            if (!admin.apps.length) {
                throw new Error('Firebase Admin not initialized');
            }

            const message = {
                topic: 'all',
                notification: {
                    title,
                    body
                },
                data: {
                    ...Object.fromEntries(
                        Object.entries(data || {}).map(([key, value]) => [key, String(value)])
                    ),
                    timestamp: String(Date.now())  // Add timestamp for tracking
                },
                android: {
                    priority: 'high',
                    notification: {
                        clickAction: 'android.intent.action.MAIN',
                        channelId: 'default'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            contentAvailable: true,
                            badge: 1,
                            sound: 'default'
                        }
                    }
                }
            };

            // Log the complete message for debugging
            logger.info('Sending FCM message:', { message });

            const response = await admin.messaging().send(message);
            logger.info('Broadcast sent successfully', {
                messageId: response,
                topic: 'all',
                title,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                messageId: response,
                topic: 'all',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error in broadcastToAll:', {
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = NotificationService;