const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProductImage extends Model {
    static associate(models) {
      ProductImage.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'CASCADE',
      });
    }
  }

  ProductImage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      public_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'ProductImage',
      tableName: 'product_images',
      underscored: true,
      timestamps: true,
    }
  );

  return ProductImage;
};
