const productService = require('../services/productService');
const storageService = require('../services/storageService');
const { sendSuccess } = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');
const ApiError = require('../utils/apiError');

const getProducts = asyncWrapper(async (req, res) => {
  const result = await productService.getWholesalerProducts(req.wholesalerId, req.query);
  return sendSuccess(res, {
    data: {
      products: result.products,
    },
    meta: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    },
  });
});

const getProductById = asyncWrapper(async (req, res) => {
  const product = await productService.getProductById(req.params.id, req.wholesalerId);
  return sendSuccess(res, {
    data: { product },
  });
});

const createProduct = asyncWrapper(async (req, res) => {
  const product = await productService.createProduct(req.wholesalerId, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Product created successfully',
    data: { product },
  });
});

const updateProduct = asyncWrapper(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.wholesalerId, req.body);
  return sendSuccess(res, {
    message: 'Product updated successfully',
    data: { product },
  });
});

const deleteProduct = asyncWrapper(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id, req.wholesalerId);
  return sendSuccess(res, {
    message: result.message,
    data: result,
  });
});

const uploadImage = asyncWrapper(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No image file uploaded');
  }

  const uploadResult = await storageService.uploadFile(req.file, 'product-images');
  return sendSuccess(res, {
    message: 'Image uploaded successfully',
    data: uploadResult,
  });
});

const addImage = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const image = await productService.addProductImage(productId, req.wholesalerId, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Image added to product',
    data: { image },
  });
});

const deleteImage = asyncWrapper(async (req, res) => {
  const { productId, imageId } = req.params;
  const result = await productService.deleteProductImage(imageId, productId, req.wholesalerId);
  return sendSuccess(res, {
    message: result.message,
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  addImage,
  deleteImage,
};
