const express = require('express');
const UserController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');
const router = express.Router();

// Public routes
router.post('/register', UserController.registerUser);

// Protected routes
router.put('/profile',
    auth,
    upload.single('photo'),
    UserController.updateProfile
);

router.get('/profile',
    auth,
    UserController.getProfile
);

module.exports = router;
