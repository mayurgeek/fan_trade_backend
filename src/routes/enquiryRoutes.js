const express = require("express");
const router = express.Router();
const enquiryController = require("../controllers/enquiryController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { enquiryLimiter } = require("../middlewares/rateLimiter");
const { createEnquirySchema } = require("../validations/enquiryValidation");
const { ROLES } = require("../config/constants");

// Retailer sends enquiry
router.post(
  "/",
  enquiryLimiter,
  authenticate,
  requireRole(ROLES.RETAILER),
  validate(createEnquirySchema),
  enquiryController.createEnquiry,
);

// Retailer tracks own enquiries
router.get(
  "/mine",
  authenticate,
  requireRole(ROLES.RETAILER),
  enquiryController.getRetailerEnquiries,
);

router.get(
  "/mine/:id",
  authenticate,
  requireRole(ROLES.RETAILER),
  enquiryController.getRetailerEnquiryById,
);

module.exports = router;
