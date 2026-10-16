const { z } = require('zod');
const { ROLES } = require('../config/constants');
const { indianPhoneSchema, optionalIndianPhoneSchema } = require('../utils/indianPhone');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: indianPhoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.WHOLESALER, ROLES.RETAILER], {
    errorMap: () => ({ message: 'Role must be wholesaler or retailer' }),
  }),
  shop_name: z.string().optional(),
  address: z.string().optional(),
  business_name: z.string().optional(),
  slug: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: optionalIndianPhoneSchema,
  address: z.string().optional().nullable(),
  shop_name: z.string().optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
