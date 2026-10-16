const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public catalog routes
router.get('/wholesalers', publicController.getWholesalers);
router.get('/catalog/:slug', publicController.getCatalog);
router.get('/catalog/:slug/categories', publicController.getCatalogCategories);
router.get('/catalog/:slug/products', publicController.getCatalogProducts);
router.get('/catalog/:slug/products/:productSlug', publicController.getCatalogProductBySlug);

// Marketplace explore routes
router.get('/products', publicController.getMarketplaceProducts);
router.get('/categories', publicController.getMarketplaceCategories);

module.exports = router;
