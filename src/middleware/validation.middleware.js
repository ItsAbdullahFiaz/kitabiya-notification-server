const Joi = require('joi');

const validationMiddleware = {
    validateNotification: (req, res, next) => {
        const schema = Joi.object({
            token: Joi.string().required(),
            title: Joi.string().required(),
            body: Joi.string().required(),
            data: Joi.object().pattern(
                Joi.string(),
                Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
            ).optional()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(x => x.message)
            });
        }
        next();
    },
    validateProduct: (req, res, next) => {
        const productSchema = Joi.object({
            userId: Joi.string().required(),
            category: Joi.object({
                id: Joi.string().required(),
                subCategoryId: Joi.string().required()
            }).required(),
            condition: Joi.string().required(),
            type: Joi.string().required(),
            language: Joi.string().required(),
            title: Joi.string().required(),
            description: Joi.string().required(),
            location: Joi.object({
                latitude: Joi.number().required(),
                longitude: Joi.number().required(),
                address: Joi.string().required()
            }).required(),
            price: Joi.number().required()
        });

        const { error } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(x => x.message)
            });
        }
        next();
    }
};

module.exports = validationMiddleware;
