const { Op } = require('sequelize');
const { Product, ProductImage, Category, WholesalerProfile, sequelize } = require('../models');
const ApiError = require('../utils/apiError');
const { generateSlug } = require('../utils/slugHelpers');
const { PRODUCT_AVAILABILITY } = require('../config/constants');

function buildImageRecords(productId, images) {
  const hasExplicitPrimary = images.some((img) => img.is_primary === true);
  let primaryAssigned = false;

  return images.map((img, idx) => {
    let isPrimary = false;
    if (hasExplicitPrimary) {
      if (img.is_primary === true && !primaryAssigned) {
        isPrimary = true;
        primaryAssigned = true;
      }
    } else if (idx === 0) {
      isPrimary = true;
      primaryAssigned = true;
    }

    return {
      product_id: productId,
      url: img.url,
      public_id: img.public_id || null,
      is_primary: isPrimary,
      sort_order: idx + 1,
    };
  });
}

const productIncludes = [
  {
    model: Category,
    as: 'category',
    attributes: ['id', 'name', 'slug'],
  },
  {
    model: ProductImage,
    as: 'images',
    separate: true,
    order: [
      ['is_primary', 'DESC'],
      ['sort_order', 'ASC'],
    ],
  },
];

class ProductService {
  async getWholesalerProducts(wholesalerId, query = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      categoryId = '',
      availability = '',
      isActive,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = { wholesaler_id: wholesalerId };

    if (search && search.trim()) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { sku: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    if (availability) {
      where.availability = availability;
    }

    if (isActive !== undefined && isActive !== '') {
      where.is_active = isActive === 'true' || isActive === true;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: productIncludes,
      distinct: true,
    });

    return {
      products: rows,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
    };
  }

  async getProductById(id, wholesalerId) {
    const product = await Product.findOne({
      where: { id, wholesaler_id: wholesalerId },
      include: productIncludes,
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  async createProduct(wholesalerId, data) {
    // Validate category belongs to this wholesaler
    const category = await Category.findOne({
      where: { id: data.category_id, wholesaler_id: wholesalerId },
    });

    if (!category) {
      throw ApiError.badRequest('Invalid category. Please select one of your own categories.');
    }

    let desiredSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    if (!desiredSlug) {
      desiredSlug = 'prod-' + Math.floor(1000 + Math.random() * 9000);
    }

    const existing = await Product.findOne({
      where: { wholesaler_id: wholesalerId, slug: desiredSlug },
    });

    if (existing) {
      desiredSlug = `${desiredSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    return await sequelize.transaction(async (t) => {
      const product = await Product.create(
        {
          wholesaler_id: wholesalerId,
          category_id: data.category_id,
          name: data.name.trim(),
          slug: desiredSlug,
          description: data.description ? data.description.trim() : null,
          sku: data.sku ? data.sku.trim() : null,
          price:
            data.price !== undefined && data.price !== '' && data.price !== null
              ? parseFloat(data.price)
              : null,
          unit: data.unit ? data.unit.trim() : 'Piece',
          min_order_qty:
            data.min_order_qty !== undefined && data.min_order_qty !== ''
              ? parseInt(data.min_order_qty, 10)
              : 1,
          availability: data.availability || PRODUCT_AVAILABILITY.IN_STOCK,
          specifications: Array.isArray(data.specifications) ? data.specifications : [],
          is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
          is_featured: data.is_featured !== undefined ? Boolean(data.is_featured) : false,
        },
        { transaction: t }
      );

      if (Array.isArray(data.images) && data.images.length > 0) {
        await ProductImage.bulkCreate(buildImageRecords(product.id, data.images), {
          transaction: t,
        });
      }

      return Product.findByPk(product.id, {
        include: productIncludes,
        transaction: t,
      });
    });
  }

  async updateProduct(id, wholesalerId, data) {
    const product = await Product.findOne({
      where: { id, wholesaler_id: wholesalerId },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return await sequelize.transaction(async (t) => {
      if (data.category_id && data.category_id !== product.category_id) {
        const category = await Category.findOne({
          where: { id: data.category_id, wholesaler_id: wholesalerId },
          transaction: t,
        });
        if (!category) {
          throw ApiError.badRequest('Invalid category. Please select one of your own categories.');
        }
        product.category_id = data.category_id;
      }

      if (data.name) product.name = data.name.trim();

      if (data.slug) {
        const newSlug = generateSlug(data.slug);
        if (newSlug !== product.slug) {
          const existing = await Product.findOne({
            where: {
              wholesaler_id: wholesalerId,
              slug: newSlug,
              id: { [Op.ne]: id },
            },
            transaction: t,
          });
          if (existing) {
            throw ApiError.badRequest('A product with this slug already exists in your store');
          }
          product.slug = newSlug;
        }
      }

      if (data.description !== undefined) product.description = data.description ? data.description.trim() : null;
      if (data.sku !== undefined) product.sku = data.sku ? data.sku.trim() : null;

      if (data.price !== undefined) {
        product.price = data.price !== '' && data.price !== null ? parseFloat(data.price) : null;
      }

      if (data.unit) product.unit = data.unit.trim();
      if (data.min_order_qty !== undefined && data.min_order_qty !== '') {
        product.min_order_qty = parseInt(data.min_order_qty, 10);
      }
      if (data.availability) product.availability = data.availability;
      if (data.specifications !== undefined) {
        product.specifications = Array.isArray(data.specifications) ? data.specifications : [];
      }
      if (data.is_active !== undefined) product.is_active = Boolean(data.is_active);
      if (data.is_featured !== undefined) product.is_featured = Boolean(data.is_featured);

      await product.save({ transaction: t });

      if (Array.isArray(data.images)) {
        await ProductImage.destroy({ where: { product_id: product.id }, transaction: t });
        if (data.images.length > 0) {
          await ProductImage.bulkCreate(buildImageRecords(product.id, data.images), {
            transaction: t,
          });
        }
      }

      return Product.findByPk(id, {
        include: productIncludes,
        transaction: t,
      });
    });
  }

  async deleteProduct(id, wholesalerId) {
    const product = await Product.findOne({
      where: { id, wholesaler_id: wholesalerId },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    await product.destroy();
    return { id, message: 'Product deleted successfully' };
  }

  async addProductImage(productId, wholesalerId, { url, public_id, is_primary }) {
    const product = await Product.findOne({
      where: { id: productId, wholesaler_id: wholesalerId },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const currentCount = await ProductImage.count({ where: { product_id: productId } });

    if (is_primary) {
      await ProductImage.update({ is_primary: false }, { where: { product_id: productId } });
    }

    const image = await ProductImage.create({
      product_id: productId,
      url,
      public_id: public_id || null,
      is_primary: is_primary || currentCount === 0,
      sort_order: currentCount + 1,
    });

    return image;
  }

  async deleteProductImage(imageId, productId, wholesalerId) {
    const product = await Product.findOne({
      where: { id: productId, wholesaler_id: wholesalerId },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const image = await ProductImage.findOne({
      where: { id: imageId, product_id: productId },
    });

    if (!image) {
      throw ApiError.notFound('Image not found');
    }

    const wasPrimary = image.is_primary;
    await image.destroy();

    // If primary was deleted, promote another image
    if (wasPrimary) {
      const remaining = await ProductImage.findOne({
        where: { product_id: productId },
        order: [['sort_order', 'ASC']],
      });
      if (remaining) {
        remaining.is_primary = true;
        await remaining.save();
      }
    }

    return { message: 'Image deleted' };
  }
}

module.exports = new ProductService();
