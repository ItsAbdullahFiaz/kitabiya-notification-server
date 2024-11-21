const UserService = require('../services/user.service');
const logger = require('../utils/logger');

class UserController {
    static async registerUser(req, res, next) {
        try {
            const { name, email } = req.body;

            if (!name || !email) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Name and email are required'
                });
            }

            const user = await UserService.createUser({ name, email });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
