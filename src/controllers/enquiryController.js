const enquiryService = require('../services/enquiryService');
const { sendSuccess } = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

const createEnquiry = asyncWrapper(async (req, res) => {
  const retailerId = req.user ? req.user.id : null;
  const { items, channel, name, email, phone, address, message } = req.body;

  const result = await enquiryService.createEnquiry({
    retailerId,
    items,
    channel,
    name,
    email,
    phone,
    address,
    message,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Enquiry submitted successfully',
    data: result,
  });
});

const getWholesalerEnquiries = asyncWrapper(async (req, res) => {
  const result = await enquiryService.getWholesalerEnquiries(req.wholesalerId, req.query);
  return sendSuccess(res, {
    data: {
      enquiries: result.enquiries,
      unreadCount: result.unreadCount,
    },
    meta: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    },
  });
});

const getWholesalerEnquiryById = asyncWrapper(async (req, res) => {
  const enquiry = await enquiryService.getWholesalerEnquiryById(req.params.id, req.wholesalerId);
  return sendSuccess(res, {
    data: { enquiry },
  });
});

const updateEnquiryStatus = asyncWrapper(async (req, res) => {
  const enquiry = await enquiryService.updateEnquiryStatus(
    req.params.id,
    req.wholesalerId,
    req.body
  );
  return sendSuccess(res, {
    message: 'Enquiry updated successfully',
    data: { enquiry },
  });
});

const getRetailerEnquiries = asyncWrapper(async (req, res) => {
  const result = await enquiryService.getRetailerEnquiries(req.user.id, req.query);
  return sendSuccess(res, {
    data: {
      enquiries: result.enquiries,
    },
    meta: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    },
  });
});

const getRetailerEnquiryById = asyncWrapper(async (req, res) => {
  const enquiry = await enquiryService.getRetailerEnquiryById(req.params.id, req.user.id);
  return sendSuccess(res, {
    data: { enquiry },
  });
});

module.exports = {
  createEnquiry,
  getWholesalerEnquiries,
  getWholesalerEnquiryById,
  updateEnquiryStatus,
  getRetailerEnquiries,
  getRetailerEnquiryById,
};
