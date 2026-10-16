const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { productSchema } = require('../validations/productValidation');
const { createEnquirySchema } = require('../validations/enquiryValidation');
const { registerSchema } = require('../validations/authValidation');
const { updateWholesalerProfileSchema } = require('../validations/wholesalerValidation');

const validProduct = {
  category_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  name: 'AeroBlade 1200',
  price: 2850,
  min_order_qty: 10,
  specifications: [],
  images: [{ url: '/uploads/fan.jpg', is_primary: true }],
};

describe('Product and enquiry schema regressions', () => {
  it('accepts a product without prefilled specifications', () => {
    const parsed = productSchema.parse(validProduct);
    assert.deepEqual(parsed.specifications, []);
  });

  it('accepts seeded public image paths and uploaded paths', () => {
    assert.doesNotThrow(() =>
      productSchema.parse({
        ...validProduct,
        images: [{ url: '/images/products/aerovort_bldc_fan.jpg' }],
      })
    );
    assert.doesNotThrow(() =>
      productSchema.parse({
        ...validProduct,
        images: [{ url: 'https://cdn.example.com/fan.jpg' }],
      })
    );
    assert.throws(() =>
      productSchema.parse({
        ...validProduct,
        images: [{ url: 'javascript:alert(1)' }],
      })
    );
  });

  it('rejects negative product price and MOQ', () => {
    assert.throws(() => productSchema.parse({ ...validProduct, price: -100 }), /cannot be negative/);
    assert.throws(() => productSchema.parse({ ...validProduct, min_order_qty: -2 }), /cannot be negative/);
  });

  it('rejects invalid enquiry phones and negative quantities', () => {
    const base = {
      items: [{ productId: validProduct.category_id, quantity: 10 }],
      channel: 'email',
      name: 'Pooja Sharma',
      email: 'pooja@example.com',
      phone: '9876543210',
    };
    const parsed = createEnquirySchema.parse(base);
    assert.equal(parsed.phone, '+919876543210');

    assert.throws(() => createEnquirySchema.parse({ ...base, phone: '987654321' }), /10-digit Indian mobile/);
    assert.throws(() => createEnquirySchema.parse({ ...base, phone: '98765432101' }), /10-digit Indian mobile/);
    assert.throws(
      () => createEnquirySchema.parse({ ...base, items: [{ productId: validProduct.category_id, quantity: -1 }] }),
      /cannot be negative/
    );
  });

  it('accepts a zero wholesale price and rejects non-finite prices', () => {
    assert.doesNotThrow(() => productSchema.parse({ ...validProduct, price: 0 }));
    assert.throws(() => productSchema.parse({ ...validProduct, price: Number.NaN }));
  });

  it('rejects unsafe wholesaler logo URLs', () => {
    assert.doesNotThrow(() =>
      updateWholesalerProfileSchema.parse({ logo_url: '/uploads/logo.png' })
    );
    assert.throws(() =>
      updateWholesalerProfileSchema.parse({ logo_url: 'javascript:alert(1)' })
    );
  });

  it('register schema requires a valid Indian mobile number', () => {
    const payload = {
      name: 'Retail Buyer',
      email: 'buyer@example.com',
      phone: '9123456789',
      password: 'secret1',
      role: 'retailer',
    };
    assert.equal(registerSchema.parse(payload).phone, '+919123456789');
    assert.throws(() => registerSchema.parse({ ...payload, phone: 'abc' }), /10-digit Indian mobile/);
  });
});
