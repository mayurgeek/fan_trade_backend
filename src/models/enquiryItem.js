const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EnquiryItem extends Model {
    static associate(models) {
      EnquiryItem.belongsTo(models.Enquiry, {
        foreignKey: 'enquiry_id',
        as: 'enquiry',
        onDelete: 'CASCADE',
      });
      EnquiryItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'SET NULL',
      });
    }
  }

  EnquiryItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      enquiry_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      product_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price_snapshot: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'EnquiryItem',
      tableName: 'enquiry_items',
      underscored: true,
      timestamps: true,
    }
  );

  return EnquiryItem;
};
