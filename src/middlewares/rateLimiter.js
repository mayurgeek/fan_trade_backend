const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/responseFormatter');

const rateLimitHandler = (req, res) => {
  return sendError(res, {
    statusCode: 429,
    message: 'Too many requests from this IP, please try again later.',
  });
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit login/register attempts
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit enquiry creations to prevent spam
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  enquiryLimiter,
};
