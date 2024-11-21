const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kitabya Backend API',
            version: '1.0.0',
            description: 'API documentation for Kitabya Book Marketplace',
        },
        servers: [
            {
                url: 'https://kitabiya.glitch.me',
                description: 'Production server'
            },
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                Product: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        title: { type: 'string' },
                        price: { type: 'number' },
                        category: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                subCategoryId: { type: 'string' }
                            }
                        },
                        condition: { type: 'string' },
                        type: { type: 'string' },
                        language: { type: 'string' },
                        description: { type: 'string' },
                        location: {
                            type: 'object',
                            properties: {
                                latitude: { type: 'number' },
                                longitude: { type: 'number' },
                                address: { type: 'string' }
                            }
                        },
                        images: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
