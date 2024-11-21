const validateProduct = (req, res, next) => {
    try {
        const requiredFields = [
            'userId',
            'title',
            'price',
            'categoryId',
            'categorySubId',
            'condition',
            'type',
            'language',
            'description',
            'locationLatitude',
            'locationLongitude',
            'locationAddress'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Missing required fields',
                missingFields
            });
        }

        // Validate images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'At least one image is required'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { validateProduct }; 