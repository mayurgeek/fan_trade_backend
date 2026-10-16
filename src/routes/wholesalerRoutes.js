const express = require('express');
const router = express.Router();
const wholesalerController = require('../controllers/wholesalerController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const enquiryController = require('../controllers/enquiryController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { ROLES } = require('../config/constants');
const { updateWholesalerProfileSchema } = require('../validations/wholesalerValidation');
const { categorySchema } = require('../validations/categoryValidation');
const { productSchema } = require('../validations/productValidation');
const { updateEnquiryStatusSchema } = require('../validations/enquiryValidation');

// All wholesaler routes require authentication and WHOLESALER role
router.use(authenticate, requireRole(ROLES.WHOLESALER));

// Store profile & dashboard
router.get('/profile', wholesalerController.getProfile);
router.put(
  '/profile',
  validate(updateWholesalerProfileSchema),
  wholesalerController.updateProfile
);
router.get('/slug-check', wholesalerController.checkSlug);
router.get('/dashboard-stats', wholesalerController.getDashboardStats);
router.post(
  '/upload-asset',
  upload.single('image'),
  wholesalerController.uploadAsset
);

// Categories CRUD
router.get('/categories', categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.post(
  '/categories',
  validate(categorySchema),
  categoryController.createCategory
);
router.put(
  '/categories/:id',
  validate(categorySchema),
  categoryController.updateCategory
);
router.delete('/categories/:id', categoryController.deleteCategory);

// Products CRUD
router.get('/products', productController.getProducts);
router.post(
  '/products/upload-image',
  upload.single('image'),
  productController.uploadImage
);
router.get('/products/:id', productController.getProductById);
router.post(
  '/products',
  validate(productSchema),
  productController.createProduct
);
router.put(
  '/products/:id',
  validate(productSchema),
  productController.updateProduct
);
router.delete('/products/:id', productController.deleteProduct);

router.post('/products/:productId/images', productController.addImage);
router.delete(
  '/products/:productId/images/:imageId',
  productController.deleteImage
);

// Enquiries inbox
router.get('/enquiries', enquiryController.getWholesalerEnquiries);
router.get('/enquiries/:id', enquiryController.getWholesalerEnquiryById);
router.patch(
  '/enquiries/:id/status',
  validate(updateEnquiryStatusSchema),
  enquiryController.updateEnquiryStatus
);

module.exports = router;
