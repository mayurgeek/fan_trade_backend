const { z } = require('zod');
const { CHANNELS, ENQUIRY_STATUSES } = require('../config/constants');
const { indianPhoneSchema } = require('../utils/indianPhone');
const { quantitySchema } = require('../utils/numericFields');

const enquiryItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: quantitySchema,
});

const createEnquirySchema = z.object({
  items: z.array(enquiryItemSchema).min(1, 'At least one item is required'),
  channel: z.enum([CHANNELS.EMAIL, CHANNELS.WHATSAPP], {
    errorMap: () => ({ message: 'Channel must be "email" or "whatsapp"' }),
  }),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: indianPhoneSchema,
  address: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

const updateEnquiryStatusSchema = z.object({
  status: z
    .enum([
      ENQUIRY_STATUSES.NEW,
      ENQUIRY_STATUSES.VIEWED,
      ENQUIRY_STATUSES.RESPONDED,
      ENQUIRY_STATUSES.CLOSED,
    ])
    .optional(),
  internal_note: z.string().optional().nullable(),
});

module.exports = {
  createEnquirySchema,
  updateEnquiryStatusSchema,
};
