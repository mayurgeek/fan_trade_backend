const categoryService = require('../services/categoryService');
const { sendSuccess } = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

const getCategories = asyncWrapper(async (req, res) => {
  const activeOnly = req.query.activeOnly === 'true';
  const categories = await categoryService.getCategories(req.wholesalerId, { activeOnly });
  return sendSuccess(res, {
    data: { categories },
  });
});

const getCategoryById = asyncWrapper(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id, req.wholesalerId);
  return sendSuccess(res, {
    data: { category },
  });
});

const createCategory = asyncWrapper(async (req, res) => {
  const category = await categoryService.createCategory(req.wholesalerId, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Category created successfully',
    data: { category },
  });
});

const updateCategory = asyncWrapper(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.wholesalerId, req.body);
  return sendSuccess(res, {
    message: 'Category updated successfully',
    data: { category },
  });
});

const deleteCategory = asyncWrapper(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id, req.wholesalerId);
  return sendSuccess(res, {
    message: result.message,
    data: result,
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
