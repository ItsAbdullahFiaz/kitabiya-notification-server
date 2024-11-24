const express = require('express');
const router = express.Router();
const { AuthController } = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

// Apply auth middleware to both routes
router.post('/login', auth, AuthController.login);
router.get('/me', auth, AuthController.getMe);

module.exports = router;