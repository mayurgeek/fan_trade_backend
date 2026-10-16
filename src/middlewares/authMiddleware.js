const jwt = require('jsonwebtoken');
const { User, WholesalerProfile } = require('../models');
const ApiError = require('../utils/apiError');
const config = require('../config');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is required'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch (err) {
      return next(ApiError.unauthorized('Invalid or expired authentication token'));
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: WholesalerProfile,
          as: 'wholesalerProfile',
        },
      ],
    });

    if (!user || !user.is_active) {
      return next(ApiError.unauthorized('User not found or inactive'));
    }

    req.user = user;
    if (user.wholesalerProfile) {
      req.wholesalerId = user.wholesalerProfile.id;
    }

    next();
  } catch (err) {
    next(err);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] },
        include: [{ model: WholesalerProfile, as: 'wholesalerProfile' }],
      });
      if (user && user.is_active) {
        req.user = user;
        if (user.wholesalerProfile) {
          req.wholesalerId = user.wholesalerProfile.id;
        }
      }
    } catch (err) {
      // Ignore token verification errors in optionalAuth
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
