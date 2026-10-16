const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RefreshToken extends Model {
    static associate(models) {
      RefreshToken.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  }

  RefreshToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      underscored: true,
      timestamps: true,
    }
  );

  return RefreshToken;
};
