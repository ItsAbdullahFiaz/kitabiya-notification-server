const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/v1/products/popular:
 *   get:
 *     summary: Get popular products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Popular products retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/popular', ProductController.getPopularProducts);

/**
 * @swagger
 * /api/v1/products/recent-searches:
 *   get:
 *     summary: Get user's recent product searches
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get recent searches for
 *     responses:
 *       200:
 *         description: Recent searches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 * 
 *   post:
 *     summary: Add a product to recent searches
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user
 *               productId:
 *                 type: string
 *                 description: ID of the product being viewed
 *     responses:
 *       200:
 *         description: Successfully added to recent searches
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     summary: Clear recent searches for a user
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to clear recent searches for
 *     responses:
 *       200:
 *         description: Recent searches cleared successfully
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/recent-searches', ProductController.getRecentSearches);
router.post('/recent-searches', ProductController.addToRecentSearches);
router.delete('/recent-searches', ProductController.clearRecentSearches);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (max 5)
 *               title:
 *                 type: string
 *                 description: Product title
 *               price:
 *                 type: number
 *                 description: Product price
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               categorySubId:
 *                 type: string
 *                 description: Sub-category ID
 *               condition:
 *                 type: string
 *                 description: Product condition
 *               type:
 *                 type: string
 *                 description: Product type
 *               language:
 *                 type: string
 *                 description: Book language
 *               description:
 *                 type: string
 *                 description: Product description
 *               locationLatitude:
 *                 type: number
 *                 description: Location latitude
 *               locationLongitude:
 *                 type: number
 *                 description: Location longitude
 *               locationAddress:
 *                 type: string
 *                 description: Location address
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', upload.array('images', 5), ProductController.createProduct);

/**
 * @swagger
 * /api/v1/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search text
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Product type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/search', ProductController.searchProducts);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', ProductController.getAllProducts);

/**
 * @swagger
 * /api/v1/products/user/{userId}:
 *   get:
 *     summary: Get user's products
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's products retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', ProductController.getProductsByUser);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/:id', upload.array('images', 5), ProductController.updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', ProductController.deleteProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', ProductController.getProductById);

/**
 * @swagger
 * /api/v1/products/{productId}/report:
 *   post:
 *     summary: Report a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - reason
 *               - description
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "67417edd62c15e0bd0e5b9ac"
 *               reason:
 *                 type: string
 *                 enum: [inappropriate, spam, fake, offensive, other]
 *               description:
 *                 type: string
 *                 example: "This product contains inappropriate content"
 *     responses:
 *       201:
 *         description: Product reported successfully
 *       400:
 *         description: Invalid input or duplicate report
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/v1/products/{productId}/reports:
 *   get:
 *     summary: Get all reports for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of reports retrieved successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/products/reports/{reportId}/status:
 *   patch:
 *     summary: Update report status
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - adminId
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, resolved]
 *               adminComment:
 *                 type: string
 *                 example: "Content reviewed and found inappropriate"
 *               adminId:
 *                 type: string
 *                 example: "67417edd62c15e0bd0e5b9ac"
 *     responses:
 *       200:
 *         description: Report status updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Report not found
 */

// Report routes
router.post('/:productId/report', ProductController.reportProduct);
router.get('/:productId/reports', ProductController.getProductReports);
router.patch('/reports/:reportId/status', ProductController.updateReportStatus);

module.exports = router;
