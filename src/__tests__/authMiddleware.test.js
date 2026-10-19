const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { authenticate, optionalAuth } = require('../middlewares/authMiddleware');
const config = require('../config');

describe('Auth Middleware Token Extraction', () => {
  it('rejects requests with no token', async () => {
    const req = { headers: {}, cookies: {} };
    let receivedError;

    await authenticate(req, {}, (err) => {
      receivedError = err;
    });

    assert.ok(receivedError);
    assert.equal(receivedError.statusCode, 401);
    assert.equal(receivedError.message, 'Authentication token is required');
  });

  it('rejects requests with invalid token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid_dummy_token_123',
      },
      cookies: {},
    };
    let receivedError;

    await authenticate(req, {}, (err) => {
      receivedError = err;
    });

    assert.ok(receivedError);
    assert.equal(receivedError.statusCode, 401);
    assert.equal(receivedError.message, 'Invalid or expired authentication token');
  });

  it('allows optionalAuth to pass without error when no token is present', async () => {
    const req = { headers: {}, cookies: {} };
    let nextCalled = false;

    await optionalAuth(req, {}, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user, undefined);
  });
});
