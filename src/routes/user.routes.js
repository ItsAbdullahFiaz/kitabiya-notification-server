const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or validation error
 *       500:
 *         description: Server error
 */
router.post('/register', UserController.registerUser);

module.exports = router;
