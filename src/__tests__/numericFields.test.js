const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  optionalNonNegativePrice,
  optionalPositiveInt,
  optionalNonNegativeInt,
  quantitySchema,
} = require('../utils/numericFields');

describe('Non-negative numeric validation', () => {
  it('rejects negative prices and accepts zero and decimals', () => {
    assert.doesNotThrow(() => optionalNonNegativePrice.parse(0));
    assert.doesNotThrow(() => optionalNonNegativePrice.parse(12.5));
    assert.doesNotThrow(() => optionalNonNegativePrice.parse('99.99'));
    assert.throws(() => optionalNonNegativePrice.parse(-1), /cannot be negative/);
    assert.throws(() => optionalNonNegativePrice.parse('-10'), /cannot be negative/);
    assert.throws(() => optionalNonNegativePrice.parse(Number.POSITIVE_INFINITY), /valid number/);
  });

  it('rejects negative MOQ and requires a positive integer', () => {
    const moq = optionalPositiveInt('MOQ');
    assert.doesNotThrow(() => moq.parse(1));
    assert.doesNotThrow(() => moq.parse(24));
    assert.throws(() => moq.parse(0), /at least 1/);
    assert.throws(() => moq.parse(-5), /cannot be negative/);
    assert.throws(() => moq.parse(1.5), /whole number/);
  });

  it('rejects negative sort order and allows zero', () => {
    const sortOrder = optionalNonNegativeInt('Sort order');
    assert.doesNotThrow(() => sortOrder.parse(0));
    assert.throws(() => sortOrder.parse(-1), /cannot be negative/);
  });

  it('rejects negative enquiry quantities', () => {
    assert.equal(quantitySchema.parse(1), 1);
    assert.throws(() => quantitySchema.parse(0), /at least 1/);
    assert.throws(() => quantitySchema.parse(-3), /cannot be negative/);
    assert.throws(() => quantitySchema.parse(2.2), /whole number/);
  });
});
