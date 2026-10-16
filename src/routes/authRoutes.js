const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../validations/authValidation');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.patch('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
