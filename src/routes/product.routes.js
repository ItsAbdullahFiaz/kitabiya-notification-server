const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const upload = require('../middleware/upload');

router.post('/', upload.array('images', 5), ProductController.createProduct);

router.get('/', ProductController.getAllProducts);

router.get('/:id', ProductController.getProductById);

router.get('/user/:userId', ProductController.getProductsByUser);

router.put('/:id', upload.array('images', 5), ProductController.updateProduct);

router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
