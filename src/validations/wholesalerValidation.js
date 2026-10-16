const { z } = require('zod');
const { optionalIndianPhoneSchema, nullableIndianPhoneSchema } = require('../utils/indianPhone');

const optionalMediaUrl = z
  .string()
  .optional()
  .nullable()
  .refine((url) => {
    if (url === undefined || url === null || String(url).trim() === '') return true;
    const value = String(url).trim();
    if (value.startsWith('/uploads/') || value.startsWith('/images/')) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Image URL must be a valid http(s) URL or an /uploads/ path');

const updateWholesalerProfileSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  slug: z.string().min(2, 'Slug must be at least 2 characters').optional(),
  about: z.string().optional().nullable(),
  contact_email: z.string().email('Invalid contact email').optional(),
  contact_phone: optionalIndianPhoneSchema,
  whatsapp: nullableIndianPhoneSchema,
  logo_url: optionalMediaUrl,
  banner_url: optionalMediaUrl,
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  is_published: z.boolean().optional(),
});

module.exports = {
  updateWholesalerProfileSchema,
};
