const { Op } = require('sequelize');
const { WholesalerProfile, Category, Product, ProductImage, sequelize } = require('../models');
const ApiError = require('../utils/apiError');

class PublicService {
  async getWholesalers(query = {}) {
    const { page = 1, limit = 12, search = '' } = query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = { is_published: true };
    if (search && search.trim()) {
      where[Op.or] = [
        { business_name: { [Op.iLike]: `%${search.trim()}%` } },
        { about: { [Op.iLike]: `%${search.trim()}%` } },
        { city: { [Op.iLike]: `%${search.trim()}%` } },
        { state: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const { count, rows } = await WholesalerProfile.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order: [['business_name', 'ASC']],
      include: [
        {
          model: Product,
          as: 'products',
          where: { is_active: true },
          required: false,
          attributes: ['id'],
        },
        {
          model: Category,
          as: 'categories',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'name', 'slug'],
        },
      ],
      distinct: true,
    });

    const transformed = rows.map((w) => {
      const json = w.toJSON();
      json.whatsapp_available = Boolean(json.whatsapp);
      json.product_count = json.products ? json.products.length : 0;
      delete json.products;
      return json;
    });

    return {
      wholesalers: transformed,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
    };
  }

  async getCatalogBySlug(slug) {
    if (!slug) {
      throw ApiError.notFound('Catalog slug is required');
    }

    const wholesaler = await WholesalerProfile.findOne({
      where: { slug: slug.toLowerCase().trim(), is_published: true },
    });

    if (!wholesaler) {
      throw ApiError.notFound('Store catalogue not found or currently inactive');
    }

    const json = wholesaler.toJSON();
    json.whatsapp_available = Boolean(json.whatsapp);

    return json;
  }

  async getCatalogCategories(wholesalerId) {
    const categories = await Category.findAll({
      where: { wholesaler_id: wholesalerId, is_active: true },
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
      ],
      include: [
        {
          model: Product,
          as: 'products',
          where: { is_active: true },
          required: false,
          attributes: ['id'],
        },
      ],
    });

    return categories.map((cat) => {
      const json = cat.toJSON();
      json.product_count = json.products ? json.products.length : 0;
      delete json.products;
      return json;
    });
  }

  async getCatalogProducts(wholesalerId, query = {}) {
    const {
      page = 1,
      limit = 12,
      categorySlug = '',
      search = '',
      sort = 'featured',
    } = query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = {
      wholesaler_id: wholesalerId,
      is_active: true,
    };

    if (search && search.trim()) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
        { sku: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const categoryInclude = {
      model: Category,
      as: 'category',
      where: { is_active: true },
      attributes: ['id', 'name', 'slug'],
    };

    if (categorySlug && categorySlug !== 'all') {
      categoryInclude.where.slug = categorySlug;
    }

    let order = [['is_featured', 'DESC'], ['created_at', 'DESC']];
    if (sort === 'price-low') {
      order = [['price', 'ASC NULLS LAST']];
    } else if (sort === 'price-high') {
      order = [['price', 'DESC NULLS LAST']];
    } else if (sort === 'name-asc') {
      order = [['name', 'ASC']];
    } else if (sort === 'newest') {
      order = [['created_at', 'DESC']];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order,
      include: [
        categoryInclude,
        {
          model: ProductImage,
          as: 'images',
          order: [
            ['is_primary', 'DESC'],
            ['sort_order', 'ASC'],
          ],
        },
      ],
      distinct: true,
    });

    return {
      products: rows,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
    };
  }

  async getCatalogProductBySlug(wholesalerId, productSlug) {
    const product = await Product.findOne({
      where: {
        wholesaler_id: wholesalerId,
        slug: productSlug.toLowerCase().trim(),
        is_active: true,
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: ProductImage,
          as: 'images',
          order: [
            ['is_primary', 'DESC'],
            ['sort_order', 'ASC'],
          ],
        },
        {
          model: WholesalerProfile,
          as: 'wholesaler',
          attributes: [
            'id',
            'business_name',
            'slug',
            'logo_url',
            'banner_url',
            'contact_phone',
            'whatsapp',
            'contact_email',
            'city',
            'state',
          ],
        },
      ],
    });

    if (!product) {
      throw ApiError.notFound('Product not found in this catalogue');
    }

    const json = product.toJSON();
    if (json.wholesaler) {
      json.wholesaler.whatsapp_available = Boolean(json.wholesaler.whatsapp);
    }

    return json;
  }

  async getMarketplaceProducts(query = {}) {
    const {
      page = 1,
      limit = 12,
      category = '',
      wholesaler = '',
      search = '',
      sort = 'newest',
    } = query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = { is_active: true };

    if (search && search.trim()) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
        { sku: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const wholesalerInclude = {
      model: WholesalerProfile,
      as: 'wholesaler',
      where: { is_published: true },
      attributes: ['id', 'business_name', 'slug', 'city', 'state', 'whatsapp', 'contact_phone', 'logo_url'],
    };

    if (wholesaler && wholesaler !== 'all') {
      wholesalerInclude.where.slug = wholesaler;
    }

    const categoryInclude = {
      model: Category,
      as: 'category',
      where: { is_active: true },
      attributes: ['id', 'name', 'slug'],
    };

    if (category && category !== 'all') {
      categoryInclude.where[Op.or] = [
        { slug: category },
        { name: { [Op.iLike]: `%${category}%` } },
      ];
    }

    let order = [['created_at', 'DESC']];
    if (sort === 'price-low') {
      order = [['price', 'ASC NULLS LAST']];
    } else if (sort === 'price-high') {
      order = [['price', 'DESC NULLS LAST']];
    } else if (sort === 'featured') {
      order = [['is_featured', 'DESC'], ['created_at', 'DESC']];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order,
      include: [
        wholesalerInclude,
        categoryInclude,
        {
          model: ProductImage,
          as: 'images',
          order: [
            ['is_primary', 'DESC'],
            ['sort_order', 'ASC'],
          ],
        },
      ],
      distinct: true,
    });

    const transformed = rows.map((p) => {
      const json = p.toJSON();
      if (json.wholesaler) {
        json.wholesaler.whatsapp_available = Boolean(json.wholesaler.whatsapp);
      }
      return json;
    });

    return {
      products: transformed,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
    };
  }

  async getMarketplaceCategories() {
    // Get aggregated category names with counts across all published wholesalers
    const categories = await Category.findAll({
      where: { is_active: true },
      include: [
        {
          model: WholesalerProfile,
          as: 'wholesaler',
          where: { is_published: true },
          attributes: [],
        },
        {
          model: Product,
          as: 'products',
          where: { is_active: true },
          required: false,
          attributes: ['id'],
        },
      ],
      order: [['name', 'ASC']],
    });

    // Group categories by name
    const categoryMap = new Map();
    categories.forEach((c) => {
      const name = c.name.trim();
      const count = c.products ? c.products.length : 0;
      if (categoryMap.has(name)) {
        const item = categoryMap.get(name);
        item.product_count += count;
      } else {
        categoryMap.set(name, {
          name,
          slug: c.slug,
          image_url: c.image_url,
          product_count: count,
        });
      }
    });

    return Array.from(categoryMap.values());
  }
}

module.exports = new PublicService();
