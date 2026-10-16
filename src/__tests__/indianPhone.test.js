const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  extractIndianMobileDigits,
  normalizeIndianPhone,
  isValidIndianPhone,
  indianPhoneSchema,
  optionalIndianPhoneSchema,
} = require('../utils/indianPhone');

describe('Indian mobile number helpers', () => {
  it('accepts a valid 10-digit number and stores +91 once', () => {
    assert.equal(normalizeIndianPhone('9876543210'), '+919876543210');
    assert.equal(normalizeIndianPhone('+91 9876543210'), '+919876543210');
    assert.equal(normalizeIndianPhone('919876543210'), '+919876543210');
    assert.equal(isValidIndianPhone('9876543210'), true);
  });

  it('rejects 9-digit and 11-digit local numbers', () => {
    assert.equal(normalizeIndianPhone('987654321'), null);
    assert.equal(normalizeIndianPhone('98765432101'), null);
    assert.equal(isValidIndianPhone('987654321'), false);
    assert.equal(isValidIndianPhone('98765432101'), false);
  });

  it('rejects letters, spaces-only, and other invalid characters', () => {
    assert.equal(normalizeIndianPhone('98765abc10'), null);
    assert.equal(normalizeIndianPhone('abcdefghij'), null);
    assert.equal(normalizeIndianPhone(''), null);
    assert.equal(normalizeIndianPhone('   '), null);
  });

  it('does not double-prefix +91', () => {
    assert.equal(extractIndianMobileDigits('+919876543210'), '9876543210');
    assert.equal(normalizeIndianPhone('+919876543210'), '+919876543210');
  });

  it('zod schema normalizes required phone values', () => {
    assert.equal(indianPhoneSchema.parse('9876543210'), '+919876543210');
    assert.throws(() => indianPhoneSchema.parse('12345'), /10-digit Indian mobile/);
    assert.throws(() => indianPhoneSchema.parse('5876543210'), /10-digit Indian mobile/);
  });

  it('optional schema allows empty and still rejects invalid numbers', () => {
    assert.equal(optionalIndianPhoneSchema.parse(''), undefined);
    assert.equal(optionalIndianPhoneSchema.parse(null), undefined);
    assert.throws(() => optionalIndianPhoneSchema.parse('1234567890'), /10-digit Indian mobile/);
  });
});
