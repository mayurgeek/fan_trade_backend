const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

module.exports = (sequelize) => {
  class User extends Model {
    async isValidPassword(password) {
      return bcrypt.compare(password, this.password_hash);
    }

    static associate(models) {
      User.hasOne(models.WholesalerProfile, {
        foreignKey: 'user_id',
        as: 'wholesalerProfile',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Enquiry, {
        foreignKey: 'retailer_id',
        as: 'retailerEnquiries',
        onDelete: 'SET NULL',
      });
      User.hasMany(models.RefreshToken, {
        foreignKey: 'user_id',
        as: 'refreshTokens',
        onDelete: 'CASCADE',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(ROLES.WHOLESALER, ROLES.RETAILER),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      shop_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
    }
  );

  return User;
};
