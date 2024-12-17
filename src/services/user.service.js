const User = require('../models/user.model');
const logger = require('../utils/logger');
const cloudinary = require('cloudinary').v2;

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

    static async updateUserProfile(userId, updateData, photoFile) {
        try {
            let photoUrl = updateData.photoUrl;

            // If a new photo is uploaded, process it
            if (photoFile) {
                const result = await cloudinary.uploader.upload(photoFile.path, {
                    folder: 'user-profiles',
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' },
                        { quality: 'auto' }
                    ]
                });
                photoUrl = result.secure_url;
            }

            // Prepare update data
            const updateFields = {
                ...(updateData.name && { name: updateData.name }),
                ...(photoUrl && { photoUrl }),
                ...(updateData.location && { location: updateData.location }),
                ...(updateData.dateOfBirth && { dateOfBirth: new Date(updateData.dateOfBirth) })
            };

            const user = await User.findByIdAndUpdate(
                userId,
                { $set: updateFields },
                { new: true, runValidators: true }
            ).select('-__v');

            if (!user) {
                throw new Error('User not found');
            }

            logger.info('User profile updated successfully', { userId });
            return user;
        } catch (error) {
            logger.error('Error updating user profile:', error);
            throw error;
        }
    }
}

module.exports = UserService;
