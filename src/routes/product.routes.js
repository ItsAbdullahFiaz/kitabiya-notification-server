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

// Parameterized routes last
router.get('/:productId',
    auth,
    ProductController.getProduct
);

// Update product
router.put('/:id',
    auth,
    ownerAuth,
    upload.array('images', 5),
    ProductController.updateProduct
);

// Delete product
router.delete('/:id',
    auth,
    ownerAuth,
    ProductController.deleteProduct
);

// Report routes
router.post('/:productId/report',
    auth,
    ProductController.reportProduct
);

router.get('/:productId/reports',
    auth,
    ProductController.getProductReports
);

module.exports = router;
