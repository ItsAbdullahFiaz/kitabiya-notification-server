const Joi = require('joi');

const productSchema = Joi.object({
    userId: Joi.string().required(),
    title: Joi.string().required(),
    price: Joi.number().required(),
    categoryId: Joi.string().required(),
    categorySubId: Joi.string().required(),
    condition: Joi.string().required(),
    type: Joi.string().required(),
    language: Joi.string().required(),
    description: Joi.string().required(),
    locationLatitude: Joi.number().required(),
    locationLongitude: Joi.number().required(),
    locationAddress: Joi.string().required()
});

module.exports = { productSchema }; 