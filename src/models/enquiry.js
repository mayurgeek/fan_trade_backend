const { Model, DataTypes } = require('sequelize');
const { ENQUIRY_STATUSES, CHANNELS } = require('../config/constants');

module.exports = (sequelize) => {
  class Enquiry extends Model {
    static associate(models) {
      Enquiry.belongsTo(models.WholesalerProfile, {
        foreignKey: 'wholesaler_id',
        as: 'wholesaler',
        onDelete: 'CASCADE',
      });
      Enquiry.belongsTo(models.User, {
        foreignKey: 'retailer_id',
        as: 'retailer',
        onDelete: 'SET NULL',
      });
      Enquiry.hasMany(models.EnquiryItem, {
        foreignKey: 'enquiry_id',
        as: 'items',
        onDelete: 'CASCADE',
      });
    }
  }

  Enquiry.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      enquiry_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      wholesaler_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      retailer_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      channel: {
        type: DataTypes.ENUM(CHANNELS.EMAIL, CHANNELS.WHATSAPP),
        allowNull: false,
      },
      retailer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      retailer_email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      retailer_phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      retailer_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          ENQUIRY_STATUSES.NEW,
          ENQUIRY_STATUSES.VIEWED,
          ENQUIRY_STATUSES.RESPONDED,
          ENQUIRY_STATUSES.CLOSED
        ),
        defaultValue: ENQUIRY_STATUSES.NEW,
      },
      internal_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      email_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      email_error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Enquiry',
      tableName: 'enquiries',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          fields: ['wholesaler_id'],
        },
        {
          fields: ['retailer_id'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['channel'],
        },
        {
          fields: ['created_at'],
        },
      ],
    }
  );

  return Enquiry;
};
