# Firebase Push Notification Server

A Node.js server for sending push notifications using Firebase Cloud Messaging (FCM). Built with Express.js and follows best practices for project structure and error handling.

## Features

- Send push notifications to Android and iOS devices
- Input validation
- Comprehensive error handling
- Request logging
- API versioning
- Health check endpoint

## Project Structure

```
project-root/
├── src/
│   ├── config/
│   │   ├── firebase.config.js
│   │   └── app.config.js
│   ├── controllers/
│   │   └── notification.controller.js
│   ├── middleware/
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   ├── routes/
│   │   ├── index.js
│   │   └── notification.routes.js
│   ├── services/
│   │   └── notification.service.js
│   ├── utils/
│   │   └── logger.js
│   └── app.js
├── .env
├── .gitignore
└── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- npm
- Firebase project with FCM enabled

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=your-client-cert-url
```

4. Create logs directory:
```bash
mkdir logs
```

## Running the Server

1. Development mode:
```bash
npm run dev
```

2. Production mode:
```bash
npm start
```

## API Endpoints

### Health Check
```http
GET /api/health
```

Response:
```json
{
    "status": "ok",
    "timestamp": "2024-11-17T12:00:00.000Z",
    "uptime": 0.001
}
```

### Send Notification
```http
POST /api/v1/notifications/send
```

Request body:
```json
{
    "token": "device_token",
    "title": "Hello",
    "body": "World",
    "data": {
        "key1": "value1",
        "key2": "value2"
    }
}
```

Success Response:
```json
{
    "success": true,
    "messageId": "projects/your-project/messages/unique-message-id"
}
```

## Testing

### Using cURL

1. Health Check:
```bash
curl http://localhost:3000/api/health
```

2. Send Notification:
```bash
curl -X POST http://localhost:3000/api/v1/notifications/send \
-H "Content-Type: application/json" \
-d '{
    "token": "your-fcm-device-token",
    "title": "Test Notification",
    "body": "This is a test notification",
    "data": {
        "key1": "value1",
        "key2": "value2"
    }
}'
```

### Using Postman
Import the provided Postman collection from the `postman` directory.

## Deploying to Glitch.com

1. Create a new project on Glitch.com

2. Import from GitHub:
   - Click "New Project"
   - Choose "Import from GitHub"
   - Paste your repository URL

3. Set up environment variables:
   - Click on "Settings" (tools icon)
   - Find ".env" section
   - Add all required environment variables

4. The project will automatically deploy and run

5. Your app will be available at:
```
https://your-project-name.glitch.me
```

### Important Glitch.com Notes:
- Glitch projects automatically restart when you make changes
- Projects go to sleep after 5 minutes of inactivity
- To keep your project awake, use a service like UptimeRobot
- Logs are available in the Glitch console

## Firebase Setup

1. Go to Firebase Console
2. Create a new project or select existing one
3. Go to Project Settings > Service Accounts
4. Generate new private key
5. Use the values from the downloaded JSON in your `.env` file

## Error Handling

The server handles various error cases:
- Invalid FCM tokens
- Missing required fields
- Network errors
- Firebase service errors

## Logging

Logs are stored in:
- `logs/error.log` - for errors only
- `logs/combined.log` - for all logs

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details