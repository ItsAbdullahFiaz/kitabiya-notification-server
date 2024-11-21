# Kitabya Backend

A Node.js backend server for Kitabya - A book marketplace application. Built with Express.js and follows best practices for project structure and error handling.

## Features

- Book listing management
- Push notifications (Firebase Cloud Messaging)
- Image upload handling (Cloudinary)
- Location-based services
- MongoDB integration
- Input validation
- Comprehensive error handling
- Request logging
- API versioning
- Health check endpoint

## Project Structure

```
kitabya-backend/
├── src/
│   ├── config/
│   │   ├── firebase.config.js   # Firebase configuration
│   │   ├── db.config.js        # MongoDB configuration
│   │   └── app.config.js       # Application configuration
│   ├── controllers/
│   │   ├── notification.controller.js
│   │   └── product.controller.js
│   ├── middleware/
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   └── product.model.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── notification.routes.js
│   │   └── product.routes.js
│   ├── services/
│   │   ├── notification.service.js
│   │   └── product.service.js
│   ├── utils/
│   │   └── logger.js
│   └── app.js                  # Application entry point
├── logs/                       # Application logs
├── .env                        # Environment variables
├── .gitignore
└── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Firebase project with FCM enabled
- Cloudinary account for image storage

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kitabya-backend.git
cd kitabya-backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/kitabya

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=your-client-cert-url

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration (optional)
CORS_ORIGIN=*
```

4. Create logs directory:
```bash
mkdir logs
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
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
    "message": "Kitabya Backend is running",
    "mongodb": "connected",
    "timestamp": "2024-03-21T12:00:00.000Z"
}
```

### Products

1. Create Product
```http
POST /api/v1/products
Content-Type: multipart/form-data

Fields:
- userId: string (required)
- images: File[] (required)
- title: string (required)
- price: number (required)
- category[id]: string (required)
- category[subCategoryId]: string (required)
- condition: string (required)
- type: string (required)
- language: string (required)
- description: string (required)
- location[latitude]: number (required)
- location[longitude]: number (required)
- location[address]: string (required)
```

2. Get User's Products
```http
GET /api/v1/products/user/:userId
```

3. Get Product
```http
GET /api/v1/products/:productId
```

4. Delete Product
```http
DELETE /api/v1/products/:productId?userId=:userId
```

### Notifications

Send Push Notification
```http
POST /api/v1/notifications/send

Body:
{
    "token": "device-token",
    "title": "Notification Title",
    "body": "Notification Body",
    "data": {
        "key": "value"
    }
}
```

## Testing API Endpoints

Using cURL:

1. Health Check:
```bash
curl http://localhost:3000/api/health
```

2. Create Product:
```bash
curl -X POST http://localhost:3000/api/v1/products \
-F "userId=123" \
-F "images=@/path/to/image.jpg" \
-F "title=Test Book" \
-F "price=100" \
-F "category[id]=cat1" \
-F "category[subCategoryId]=subcat1" \
-F "condition=new" \
-F "type=book" \
-F "language=english" \
-F "description=Test description" \
-F "location[latitude]=123.456" \
-F "location[longitude]=789.012" \
-F "location[address]=Test Address"
```

3. Get User's Products:
```bash
curl http://localhost:3000/api/v1/products/user/123
```

## Error Handling

The server handles various error cases:
- Invalid input validation
- File upload errors
- Database errors
- Network errors
- Firebase service errors

## Logging

Logs are stored in:
- `logs/error.log` - for errors only
- `logs/combined.log` - for all logs

Console logging includes:
- MongoDB connection status
- Firebase initialization status
- Server startup information
- Request/Response logs in development

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details