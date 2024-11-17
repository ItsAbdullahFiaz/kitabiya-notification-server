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
    }
};

module.exports = validationMiddleware;
