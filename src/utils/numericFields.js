const { z } = require('zod');

const MAX_PRICE = 99999999.99;
const MAX_INT = 2147483647;

function toNumber(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return Number(val.trim());
  return NaN;
}

const optionalNonNegativePrice = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .superRefine((val, ctx) => {
    if (val === undefined || val === null || val === '') return;
    const n = toNumber(val);
    if (!Number.isFinite(n)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price must be a valid number' });
      return;
    }
    if (n < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price cannot be negative' });
      return;
    }
    if (n > MAX_PRICE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price is too large' });
    }
  });

const optionalPositiveInt = (fieldLabel, { min = 1 } = {}) =>
  z
    .union([z.number(), z.string()])
    .optional()
    .superRefine((val, ctx) => {
      if (val === undefined || val === '') return;
      const n = toNumber(val);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be a whole number`,
        });
        return;
      }
      if (n < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            min === 1
              ? `${fieldLabel} must be at least 1 and cannot be negative`
              : `${fieldLabel} cannot be negative`,
        });
        return;
      }
      if (n > MAX_INT) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${fieldLabel} is too large` });
      }
    });

const optionalNonNegativeInt = (fieldLabel) =>
  z
    .union([z.number(), z.string()])
    .optional()
    .superRefine((val, ctx) => {
      if (val === undefined || val === '') return;
      const n = toNumber(val);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be a whole number`,
        });
        return;
      }
      if (n < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} cannot be negative`,
        });
        return;
      }
      if (n > MAX_INT) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${fieldLabel} is too large` });
      }
    });

const quantitySchema = z
  .number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number',
  })
  .int('Quantity must be a whole number')
  .min(1, 'Quantity must be at least 1 and cannot be negative')
  .max(MAX_INT, 'Quantity is too large')
  .refine((n) => Number.isFinite(n), { message: 'Quantity must be a valid number' });

module.exports = {
  MAX_PRICE,
  MAX_INT,
  optionalNonNegativePrice,
  optionalPositiveInt,
  optionalNonNegativeInt,
  quantitySchema,
};
