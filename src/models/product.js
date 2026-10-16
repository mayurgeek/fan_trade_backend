const { Model, DataTypes } = require('sequelize');
const { PRODUCT_AVAILABILITY } = require('../config/constants');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.WholesalerProfile, {
        foreignKey: 'wholesaler_id',
        as: 'wholesaler',
        onDelete: 'CASCADE',
      });
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'RESTRICT',
      });
      Product.hasMany(models.ProductImage, {
        foreignKey: 'product_id',
        as: 'images',
        onDelete: 'CASCADE',
      });
      Product.hasMany(models.EnquiryItem, {
        foreignKey: 'product_id',
        as: 'enquiryItems',
        onDelete: 'SET NULL',
      });
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      wholesaler_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      unit: {
        type: DataTypes.STRING,
        defaultValue: 'Piece',
      },
      min_order_qty: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      availability: {
        type: DataTypes.ENUM(
          PRODUCT_AVAILABILITY.IN_STOCK,
          PRODUCT_AVAILABILITY.OUT_OF_STOCK,
          PRODUCT_AVAILABILITY.MADE_TO_ORDER
        ),
        defaultValue: PRODUCT_AVAILABILITY.IN_STOCK,
      },
      specifications: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['wholesaler_id', 'slug'],
        },
        {
          fields: ['wholesaler_id'],
        },
        {
          fields: ['category_id'],
        },
        {
          fields: ['is_active'],
        },
      ],
    }
  );

  return Product;
};
