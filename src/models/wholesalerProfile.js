const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class WholesalerProfile extends Model {
    static associate(models) {
      WholesalerProfile.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
      });
      WholesalerProfile.hasMany(models.Category, {
        foreignKey: 'wholesaler_id',
        as: 'categories',
        onDelete: 'CASCADE',
      });
      WholesalerProfile.hasMany(models.Product, {
        foreignKey: 'wholesaler_id',
        as: 'products',
        onDelete: 'CASCADE',
      });
      WholesalerProfile.hasMany(models.Enquiry, {
        foreignKey: 'wholesaler_id',
        as: 'enquiries',
        onDelete: 'CASCADE',
      });
    }
  }

  WholesalerProfile.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      business_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      logo_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      banner_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      about: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contact_email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact_phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      whatsapp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'WholesalerProfile',
      tableName: 'wholesaler_profiles',
      underscored: true,
      timestamps: true,
    }
  );

  return WholesalerProfile;
};
