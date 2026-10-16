const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/database')[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const db = {};

// Load models
const userModel = require('./user')(sequelize);
const wholesalerProfileModel = require('./wholesalerProfile')(sequelize);
const categoryModel = require('./category')(sequelize);
const productModel = require('./product')(sequelize);
const productImageModel = require('./productImage')(sequelize);
const enquiryModel = require('./enquiry')(sequelize);
const enquiryItemModel = require('./enquiryItem')(sequelize);
const refreshTokenModel = require('./refreshToken')(sequelize);

db.User = userModel;
db.WholesalerProfile = wholesalerProfileModel;
db.Category = categoryModel;
db.Product = productModel;
db.ProductImage = productImageModel;
db.Enquiry = enquiryModel;
db.EnquiryItem = enquiryItemModel;
db.RefreshToken = refreshTokenModel;

// Run associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
