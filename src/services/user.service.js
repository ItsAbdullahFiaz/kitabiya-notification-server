const User = require('../models/user.model');
const logger = require('../utils/logger');

class UserService {
    static async createUser(userData) {
        try {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                return existingUser;
            }

            const user = await User.create(userData);
            logger.info('User created successfully', { userId: user._id });
            return user;
        } catch (error) {
            logger.error('Error creating user:', error);
            throw error;
        }
    }
}

module.exports = UserService;
