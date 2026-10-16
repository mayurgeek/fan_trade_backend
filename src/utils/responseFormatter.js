const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null }) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

const sendError = (res, { statusCode = 500, message = 'Something went wrong', errors = null }) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    meta: errors ? { errors } : null,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
