const { z } = require('zod');

const INDIAN_MOBILE_ERROR =
  'Enter a valid 10-digit Indian mobile number. The country code is fixed as +91.';

const LOCAL_MOBILE_REGEX = /^[6-9]\d{9}$/;

/**
 * Extract the 10-digit local Indian mobile number from common stored formats.
 * Does not guess: only strips +91 / 91 / 0 when the remaining length is exactly 10.
 */
function extractIndianMobileDigits(raw) {
  if (raw === undefined || raw === null) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

function normalizeIndianPhone(raw) {
  const local = extractIndianMobileDigits(raw);
  if (!LOCAL_MOBILE_REGEX.test(local)) {
    return null;
  }
  return `+91${local}`;
}

function isValidIndianPhone(raw) {
  return normalizeIndianPhone(raw) !== null;
}

const indianPhoneSchema = z
  .string({ required_error: INDIAN_MOBILE_ERROR, invalid_type_error: INDIAN_MOBILE_ERROR })
  .transform((val, ctx) => {
    const normalized = normalizeIndianPhone(val);
    if (!normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: INDIAN_MOBILE_ERROR });
      return z.NEVER;
    }
    return normalized;
  });

const optionalIndianPhoneSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val, ctx) => {
    if (val === undefined || val === null || String(val).trim() === '') {
      return undefined;
    }
    const normalized = normalizeIndianPhone(val);
    if (!normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: INDIAN_MOBILE_ERROR });
      return z.NEVER;
    }
    return normalized;
  });

const nullableIndianPhoneSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val, ctx) => {
    if (val === undefined || val === null || String(val).trim() === '') {
      return null;
    }
    const normalized = normalizeIndianPhone(val);
    if (!normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: INDIAN_MOBILE_ERROR });
      return z.NEVER;
    }
    return normalized;
  });

module.exports = {
  INDIAN_MOBILE_ERROR,
  extractIndianMobileDigits,
  normalizeIndianPhone,
  isValidIndianPhone,
  indianPhoneSchema,
  optionalIndianPhoneSchema,
  nullableIndianPhoneSchema,
};
