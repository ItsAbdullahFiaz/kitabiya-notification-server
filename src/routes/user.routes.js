const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();

// The rest of the routing code stays exactly the same
router.post('/register', UserController.registerUser);

module.exports = router;
