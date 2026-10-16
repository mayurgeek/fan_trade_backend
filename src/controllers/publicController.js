const publicService = require('../services/publicService');
const { sendSuccess } = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

const getWholesalers = asyncWrapper(async (req, res) => {
  const result = await publicService.getWholesalers(req.query);
  return sendSuccess(res, {
    data: {
      wholesalers: result.wholesalers,
    },
    meta: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    },
  });
});

const getCatalog = asyncWrapper(async (req, res) => {
  const catalog = await publicService.getCatalogBySlug(req.params.slug);
  return sendSuccess(res, {
    data: { catalog },
  });
});

const getCatalogCategories = asyncWrapper(async (req, res) => {
  const catalog = await publicService.getCatalogBySlug(req.params.slug);
  const categories = await publicService.getCatalogCategories(catalog.id);
  return sendSuccess(res, {
    data: { categories },
  });
});

const getCatalogProducts = asyncWrapper(async (req, res) => {
  const catalog = await publicService.getCatalogBySlug(req.params.slug);
  const result = await publicService.getCatalogProducts(catalog.id, req.query);
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

const getCatalogProductBySlug = asyncWrapper(async (req, res) => {
  const catalog = await publicService.getCatalogBySlug(req.params.slug);
  const product = await publicService.getCatalogProductBySlug(catalog.id, req.params.productSlug);
  return sendSuccess(res, {
    data: { product },
  });
});

const getMarketplaceProducts = asyncWrapper(async (req, res) => {
  const result = await publicService.getMarketplaceProducts(req.query);
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

const getMarketplaceCategories = asyncWrapper(async (req, res) => {
  const categories = await publicService.getMarketplaceCategories();
  return sendSuccess(res, {
    data: { categories },
  });
});

module.exports = {
  getWholesalers,
  getCatalog,
  getCatalogCategories,
  getCatalogProducts,
  getCatalogProductBySlug,
  getMarketplaceProducts,
  getMarketplaceCategories,
};
