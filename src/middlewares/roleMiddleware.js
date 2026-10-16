const ApiError = require('../utils/apiError');
const { ROLES } = require('../config/constants');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden. This feature is restricted to ${allowedRoles.join(', ')} roles.`
        )
      );
    }

    if (allowedRoles.includes(ROLES.WHOLESALER) && !req.wholesalerId) {
      return next(
        ApiError.forbidden('User does not have an associated wholesaler store profile.')
      );
    }

    next();
  };
};

module.exports = {
  requireRole,
};
