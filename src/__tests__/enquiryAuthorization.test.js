const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { requireRole } = require("../middlewares/roleMiddleware");
const { ROLES } = require("../config/constants");

describe("Enquiry submission authorization", () => {
  it("rejects a wholesaler attempting to submit a retailer enquiry", () => {
    const middleware = requireRole(ROLES.RETAILER);
    let receivedError;

    middleware({ user: { role: ROLES.WHOLESALER } }, {}, (error) => {
      receivedError = error;
    });

    assert.equal(receivedError.statusCode, 403);
    assert.match(receivedError.message, /retailer/);
  });

  it("allows an authenticated retailer to submit an enquiry", () => {
    const middleware = requireRole(ROLES.RETAILER);
    let nextCalled = false;

    middleware({ user: { role: ROLES.RETAILER } }, {}, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  });
});
