const ApiError = require('../utils/apiError');
const { sendError } = require('../utils/responseFormatter');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Database validation error';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[Error Handler]', err);
  }

  return sendError(res, {
    statusCode,
    message,
    errors,
  });
};

module.exports = errorHandler;
