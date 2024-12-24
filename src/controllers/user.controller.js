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

    static async updateProfile(req, res, next) {
        try {
            // Only include fields that are provided
            const updateData = {};

            if (req.body.name) {
                updateData.name = req.body.name;
            }

            if (req.body.location) {
                updateData.location = req.body.location;
            }

            if (req.body.dateOfBirth) {
                const dob = new Date(req.body.dateOfBirth);
                if (isNaN(dob.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid date format for date of birth'
                    });
                }
                updateData.dateOfBirth = dob;
            }

            const photoFile = req.file;
            const userId = req.mongoUser._id;

            const updatedUser = await UserService.updateUserProfile(userId, updateData, photoFile);

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: {
                        _id: updatedUser._id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        photoUrl: updatedUser.photoUrl,
                        location: updatedUser.location,
                        dateOfBirth: updatedUser.dateOfBirth,
                        createdAt: updatedUser.createdAt,
                        updatedAt: updatedUser.updatedAt
                    }
                }
            });
        } catch (error) {
            logger.error('Error in updateProfile:', error);
            next(error);
        }
    }

    static async getProfile(req, res, next) {
        try {
            const user = req.mongoUser;

            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: {
                    user: {
                        _id: user._id,
                        email: user.email,
                        name: user.name,
                        photoUrl: user.photoUrl,
                        location: user.location,
                        dateOfBirth: user.dateOfBirth,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                }
            });
        } catch (error) {
            logger.error('Error in getProfile:', error);
            next(error);
        }
    }
}

module.exports = UserController;
