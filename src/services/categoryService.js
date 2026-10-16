const { Op } = require('sequelize');
const { Category, Product, sequelize } = require('../models');
const ApiError = require('../utils/apiError');
const { generateSlug } = require('../utils/slugHelpers');

class CategoryService {
  async getCategories(wholesalerId, { activeOnly = false } = {}) {
    const where = { wholesaler_id: wholesalerId };
    if (activeOnly) {
      where.is_active = true;
    }

    const categories = await Category.findAll({
      where,
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
      ],
      include: [
        {
          model: Product,
          as: 'products',
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

  async getCategoryById(id, wholesalerId) {
    const category = await Category.findOne({
      where: { id, wholesaler_id: wholesalerId },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id'],
        },
      ],
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    const json = category.toJSON();
    json.product_count = json.products ? json.products.length : 0;
    delete json.products;
    return json;
  }

  async createCategory(wholesalerId, data) {
    let desiredSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    if (!desiredSlug) {
      desiredSlug = 'cat-' + Math.floor(1000 + Math.random() * 9000);
    }

    // Check unique scoped to this wholesaler
    const existing = await Category.findOne({
      where: { wholesaler_id: wholesalerId, slug: desiredSlug },
    });

    if (existing) {
      desiredSlug = `${desiredSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const category = await Category.create({
      wholesaler_id: wholesalerId,
      name: data.name.trim(),
      slug: desiredSlug,
      description: data.description ? data.description.trim() : null,
      image_url: data.image_url || null,
      sort_order:
        data.sort_order !== undefined && data.sort_order !== ''
          ? parseInt(data.sort_order, 10)
          : 0,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    });

    return category;
  }

  async updateCategory(id, wholesalerId, data) {
    const category = await Category.findOne({
      where: { id, wholesaler_id: wholesalerId },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (data.name) category.name = data.name.trim();

    if (data.slug) {
      const newSlug = generateSlug(data.slug);
      if (newSlug !== category.slug) {
        const existing = await Category.findOne({
          where: {
            wholesaler_id: wholesalerId,
            slug: newSlug,
            id: { [Op.ne]: id },
          },
        });

        if (existing) {
          throw ApiError.badRequest('A category with this slug already exists in your store');
        }
        category.slug = newSlug;
      }
    }

    if (data.description !== undefined) {
      category.description = data.description ? data.description.trim() : null;
    }
    if (data.image_url !== undefined) {
      category.image_url = data.image_url;
    }
    if (data.sort_order !== undefined && data.sort_order !== '') {
      category.sort_order = parseInt(data.sort_order, 10);
    }
    if (data.is_active !== undefined) {
      category.is_active = Boolean(data.is_active);
    }

    await category.save();
    return category;
  }

  async deleteCategory(id, wholesalerId) {
    const category = await Category.findOne({
      where: { id, wholesaler_id: wholesalerId },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Check if category has any products
    const productCount = await Product.count({
      where: { category_id: id },
    });

    if (productCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete category "${category.name}" because it currently contains ${productCount} product(s). Please delete or reassign these products first.`
      );
    }

    await category.destroy();
    return { id, message: 'Category deleted successfully' };
  }
}

module.exports = new CategoryService();
