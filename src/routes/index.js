const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const wholesalerRoutes = require('./wholesalerRoutes');
const enquiryRoutes = require('./enquiryRoutes');
const publicRoutes = require('./publicRoutes');

router.use('/auth', authRoutes);
router.use('/wholesaler', wholesalerRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/public', publicRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'viral-catalogs-api',
  });
});

module.exports = router;
