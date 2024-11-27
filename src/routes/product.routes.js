const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ProductController } = require('../controllers/product.controller');
const { validateProduct } = require('../middleware/validateProduct');
const auth = require('../middleware/auth.middleware');
const ownerAuth = require('../middleware/ownerAuth.middleware');

// Configure multer
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Recent searches routes (place these before parameterized routes)
router.get('/recent-searches',
    auth,
    ProductController.getRecentSearches
);

router.delete('/recent-searches',
    auth,
    ProductController.deleteRecentSearches
);

router.delete('/recent-searches/:searchId',
    auth,
    ProductController.deleteRecentSearch
);

// Add this route with the other recent search routes
router.post('/recent-searches',
    auth,
    ProductController.addToRecentSearches
);

// Static routes first (before parameterized routes)
router.get('/my-products',
    auth,
    ProductController.getUserProducts
);

router.get('/search',
    auth,
    ProductController.searchProducts
);

router.get('/popular',
    auth,
    ProductController.getPopularProducts
);

// Add this new route before other routes
router.get('/',
    auth,
    ProductController.getAllProducts
);

// Create product
router.post('/',
    auth,
    upload.array('images', 5),
    validateProduct,
    ProductController.createProduct
);

// Update report status route (place this before parameterized routes)
router.patch('/reports/:reportId/status',
    auth,
    ProductController.updateReportStatus
);

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   get:
 *     summary: Get a specific product by ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to retrieve
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:productId',
    auth,
    ProductController.getProduct
);

/**
 * @swagger
 * /api/v1/products/{productId}/report:
 *   post:
 *     summary: Report a product
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - description
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: [inappropriate, spam, fake, offensive, other]
 *                 description: The reason for reporting
 *               description:
 *                 type: string
 *                 description: Detailed description of the report
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product reported successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     productId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post('/:productId/report',
    auth,
    ProductController.reportProduct
);

router.get('/:productId/reports',
    auth,
    ProductController.getProductReports
);

module.exports = router;
