const express = require('express');
const multer = require('multer');
const ProductController = require('../controllers/product.controller');
const { validateProduct } = require('../middleware/validation.middleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               category[id]:
 *                 type: string
 *               category[subCategoryId]:
 *                 type: string
 *               condition:
 *                 type: string
 *               type:
 *                 type: string
 *               language:
 *                 type: string
 *               description:
 *                 type: string
 *               location[latitude]:
 *                 type: number
 *               location[longitude]:
 *                 type: number
 *               location[address]:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/', upload.array('images', 10), validateProduct, ProductController.createProduct);

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
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/user/:userId', ProductController.getUserProducts);

router.get('/:productId', ProductController.getProduct);
router.delete('/:productId', ProductController.deleteProduct);

module.exports = router;
