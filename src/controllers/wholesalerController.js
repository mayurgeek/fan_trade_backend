const wholesalerService = require('../services/wholesalerService');
const storageService = require('../services/storageService');
const { sendSuccess } = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');
const ApiError = require('../utils/apiError');

const getProfile = asyncWrapper(async (req, res) => {
  const profile = await wholesalerService.getProfile(req.user.id);
  return sendSuccess(res, {
    data: { profile },
  });
});

const updateProfile = asyncWrapper(async (req, res) => {
  const profile = await wholesalerService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, {
    message: 'Store profile updated successfully',
    data: { profile },
  });
});

const checkSlug = asyncWrapper(async (req, res) => {
  const { slug } = req.query;
  if (!slug) {
    throw ApiError.badRequest('Slug query parameter is required');
  }
  const result = await wholesalerService.checkSlugAvailability(slug, req.wholesalerId);
  return sendSuccess(res, {
    data: result,
  });
});

const getDashboardStats = asyncWrapper(async (req, res) => {
  const stats = await wholesalerService.getDashboardStats(req.wholesalerId);
  return sendSuccess(res, {
    data: stats,
  });
});

const uploadAsset = asyncWrapper(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No image file uploaded');
  }
  const result = await storageService.uploadFile(req.file, 'wholesaler-assets');
  return sendSuccess(res, {
    message: 'Image uploaded successfully',
    data: result,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  checkSlug,
  getDashboardStats,
  uploadAsset,
};
