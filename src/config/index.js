require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://192.168.1.81:3000',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'viral_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '12345',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'viral_jwt_access_super_secret_key_2026_x!9',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'viral_jwt_refresh_super_secret_key_2026_z#4',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  business: {
    defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || '91',
    notifyEmailOnWhatsApp: process.env.NOTIFY_EMAIL_ON_WHATSAPP === 'true',
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    publicBaseUrl:
      process.env.PUBLIC_BASE_URL ||
      process.env.API_PUBLIC_URL ||
      `http://localhost:${parseInt(process.env.PORT || '5000', 10)}`,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
  },

  email: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '"FanTrade" <no-reply@viralcatalogs.com>',
  },
};

module.exports = config;
