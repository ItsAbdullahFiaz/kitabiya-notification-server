const adminAuth = async (req, res, next) => {
    try {
        console.log('Checking admin status for user:', {
            firebaseId: req.user.user_id,
            mongoUser: req.mongoUser
        });

        // Check if user exists in request
        if (!req.mongoUser) {
            console.log('No mongoUser found in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        console.log('User admin status:', {
            isAdmin: req.mongoUser.isAdmin,
            user: req.mongoUser
        });

        // Check if user is admin
        if (!req.mongoUser.isAdmin) {
            console.log('User is not admin');
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        console.log('Admin check passed');
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin authentication'
        });
    }
};

module.exports = adminAuth;