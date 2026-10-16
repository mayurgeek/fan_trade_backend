const { z } = require('zod');
const { optionalNonNegativeInt } = require('../utils/numericFields');

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  sort_order: optionalNonNegativeInt('Sort order'),
  is_active: z.boolean().optional(),
});

module.exports = {
  categorySchema,
};
