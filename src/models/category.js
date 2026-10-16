const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.WholesalerProfile, {
        foreignKey: 'wholesaler_id',
        as: 'wholesaler',
        onDelete: 'CASCADE',
      });
      Category.hasMany(models.Product, {
        foreignKey: 'category_id',
        as: 'products',
        onDelete: 'RESTRICT',
      });
    }
  }

  Category.init(
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
      image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['wholesaler_id', 'slug'],
        },
      ],
    }
  );

  return Category;
};
