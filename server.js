const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin with environment variables
admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
    })
});

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Notification server is running' });
});

// Notification endpoint
app.post('/send-notification', async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const { token, title, body, data } = req.body;

        if (!token) {
            console.log('No token provided');
            return res.status(400).json({ error: 'FCM token is required' });
        }

        const message = {
            token,
            notification: {
                title,
                body,
            },
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

        try {
            const response = await admin.messaging().send(message);
            console.log('Successfully sent notification:', response);
            res.status(200).json({ success: true, messageId: response });
        } catch (error) {
            if (error.code === 'messaging/registration-token-not-registered') {
                console.log('Invalid token:', token);
                res.status(404).json({
                    error: 'FCM token is invalid or expired',
                    code: error.code
                });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            error: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});