const { z } = require('zod');
const { PRODUCT_AVAILABILITY } = require('../config/constants');
const { optionalNonNegativePrice, optionalPositiveInt } = require('../utils/numericFields');

const specItemSchema = z.object({
  key: z.string().min(1, 'Specification name is required'),
  value: z.string().min(1, 'Specification value is required'),
});

const imageUrlSchema = z
  .string()
  .min(1, 'Image URL is required')
  .refine((url) => {
    if (url.startsWith('/uploads/') || url.startsWith('/images/')) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Image URL must be a valid http(s) URL or an /uploads/ path');

const productSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  price: optionalNonNegativePrice,
  unit: z.string().optional(),
  min_order_qty: optionalPositiveInt('MOQ'),
  availability: z
    .enum([
      PRODUCT_AVAILABILITY.IN_STOCK,
      PRODUCT_AVAILABILITY.OUT_OF_STOCK,
      PRODUCT_AVAILABILITY.MADE_TO_ORDER,
    ])
    .optional(),
  specifications: z.array(specItemSchema).optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  images: z
    .array(
      z.object({
        url: imageUrlSchema,
        public_id: z.string().optional().nullable(),
        is_primary: z.boolean().optional(),
      })
    )
    .optional(),
});

module.exports = {
  productSchema,
};
