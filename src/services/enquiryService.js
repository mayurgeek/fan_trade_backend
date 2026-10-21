const { Op } = require('sequelize');
const { Enquiry, EnquiryItem, Product, Category, WholesalerProfile, User, sequelize } = require('../models');
const ApiError = require('../utils/apiError');
const emailService = require('./emailService');
const { buildWhatsAppUrl } = require('../utils/whatsappUrlBuilder');
const { CHANNELS, ENQUIRY_STATUSES } = require('../config/constants');
const config = require('../config');

class EnquiryService {
  async generateEnquiryNo(transaction) {
    const year = new Date().getFullYear();
    const prefix = `ENQ-${year}-`;

    // Serialise number allocation within this transaction. Counting rows is not
    // safe: imported/deleted records can leave gaps, and concurrent requests can
    // otherwise receive the same reference number.
    await sequelize.query('SELECT pg_advisory_xact_lock(hashtext(:lockKey))', {
      replacements: { lockKey: `enquiry-number-${year}` },
      transaction,
    });

    const latestEnquiry = await Enquiry.findOne({
      where: { enquiry_no: { [Op.like]: `${prefix}%` } },
      order: [['enquiry_no', 'DESC']],
      attributes: ['enquiry_no'],
      transaction,
    });

    const latestSeq = latestEnquiry
      ? Number.parseInt(latestEnquiry.enquiry_no.slice(prefix.length), 10) || 0
      : 0;
    const seq = String(latestSeq + 1).padStart(6, '0');
    return `ENQ-${year}-${seq}`;
  }

  async createEnquiry({
    retailerId = null,
    items,
    channel,
    name,
    email,
    phone,
    address = null,
    message = null,
  }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest('At least one product item is required for an enquiry.');
    }

    if (![CHANNELS.EMAIL, CHANNELS.WHATSAPP].includes(channel)) {
      throw ApiError.badRequest('Invalid enquiry channel. Must be "email" or "whatsapp".');
    }

    const productIds = items.map((i) => i.productId);

    // Run transaction
    const result = await sequelize.transaction(async (t) => {
      // 1. Fetch all products with their categories and wholesaler profiles
      const dbProducts = await Product.findAll({
        where: { id: { [Op.in]: productIds } },
        include: [
          {
            model: Category,
            as: 'category',
          },
          {
            model: WholesalerProfile,
            as: 'wholesaler',
            required: true,
          },
        ],
        transaction: t,
      });

      if (dbProducts.length !== productIds.length) {
        throw ApiError.badRequest('One or more selected products could not be found.');
      }

      // 2. Validate all products belong to the same wholesaler
      const wholesalerId = dbProducts[0].wholesaler_id;
      const wholesalerProfile = dbProducts[0].wholesaler;

      const differentWholesaler = dbProducts.some((p) => p.wholesaler_id !== wholesalerId);
      if (differentWholesaler) {
        throw ApiError.badRequest('All products in an enquiry must belong to the same wholesaler.');
      }

      // 3. Validate wholesaler is published
      if (!wholesalerProfile || !wholesalerProfile.is_published) {
        throw ApiError.badRequest('This wholesaler is currently not accepting enquiries.');
      }

      // 4. Validate all products are active
      const inactiveProduct = dbProducts.find((p) => !p.is_active);
      if (inactiveProduct) {
        throw ApiError.badRequest(`Product "${inactiveProduct.name}" is currently inactive.`);
      }

      // 5. Validate quantities respect MOQ
      const productMap = new Map();
      dbProducts.forEach((p) => productMap.set(p.id, p));

      const processedItems = [];
      for (const reqItem of items) {
        const dbProd = productMap.get(reqItem.productId);
        const qty = parseInt(reqItem.quantity, 10);

        if (isNaN(qty) || qty < 1) {
          throw ApiError.badRequest(`Invalid quantity for product "${dbProd.name}".`);
        }

        if (qty < dbProd.min_order_qty) {
          throw ApiError.badRequest(
            `Minimum order quantity for "${dbProd.name}" is ${dbProd.min_order_qty} ${dbProd.unit}. You requested ${qty}.`
          );
        }

        processedItems.push({
          productId: dbProd.id,
          productName: dbProd.name,
          categoryName: dbProd.category ? dbProd.category.name : 'General',
          quantity: qty,
          unit: dbProd.unit,
          priceSnapshot: dbProd.price !== null ? dbProd.price : null,
          productSlug: dbProd.slug,
        });
      }

      // 6. Validate WhatsApp channel availability
      const targetPhone = wholesalerProfile.whatsapp;
      if (channel === CHANNELS.WHATSAPP && !targetPhone) {
        throw ApiError.unprocessable(
          'This wholesaler does not have a WhatsApp contact number configured.'
        );
      }

      // 7. Generate unique enquiry number
      const enquiryNo = await this.generateEnquiryNo(t);

      // 8. Create Enquiry record
      const enquiry = await Enquiry.create(
        {
          enquiry_no: enquiryNo,
          wholesaler_id: wholesalerId,
          retailer_id: retailerId || null,
          channel,
          retailer_name: name.trim(),
          retailer_email: email.toLowerCase().trim(),
          retailer_phone: phone.trim(),
          retailer_address: address ? address.trim() : null,
          message: message ? message.trim() : null,
          status: ENQUIRY_STATUSES.NEW,
          is_read: false,
        },
        { transaction: t }
      );

      // 9. Create Enquiry Items with snapshots
      const itemRows = processedItems.map((item) => ({
        enquiry_id: enquiry.id,
        product_id: item.productId,
        product_name: item.productName,
        category_name: item.categoryName,
        quantity: item.quantity,
        unit: item.unit,
        price_snapshot: item.priceSnapshot,
      }));

      await EnquiryItem.bulkCreate(itemRows, { transaction: t });

      return {
        enquiry,
        enquiryNo,
        wholesalerProfile,
        processedItems,
      };
    });

    const { enquiry, enquiryNo, wholesalerProfile, processedItems } = result;

    let whatsappUrl = null;

    // CASE 1: WhatsApp
    if (channel === CHANNELS.WHATSAPP) {
      const targetPhone = wholesalerProfile.whatsapp;
      const itemsForMessage = processedItems.map((i) => ({
        productName: i.productName,
        categoryName: i.categoryName,
        quantity: i.quantity,
        unit: i.unit,
        productUrl: `${config.clientUrl}/catalog/${wholesalerProfile.slug}/products/${i.productSlug}`,
      }));

      whatsappUrl = buildWhatsAppUrl({
        phoneNumber: targetPhone,
        businessName: wholesalerProfile.business_name,
        enquiryNo,
        items: itemsForMessage,
        retailerName: name.trim(),
        retailerEmail: email.trim(),
        retailerPhone: phone.trim(),
        retailerAddress: address ? address.trim() : null,
        message: message ? message.trim() : null,
      });

      // Optional email notification when configured
      if (config.business.notifyEmailOnWhatsApp) {
        emailService.sendEnquiryToWholesaler({
          wholesalerEmail: wholesalerProfile.contact_email,
          wholesalerBusinessName: wholesalerProfile.business_name,
          enquiryNo,
          retailerName: name,
          retailerEmail: email,
          retailerPhone: phone,
          retailerAddress: address,
          items: processedItems,
          message,
          dashboardUrl: `${config.clientUrl}/dashboard/enquiries`,
        }).catch((err) => console.error('[Enquiry] Async email error:', err));
      }
    }

    // CASE 2: Email
    if (channel === CHANNELS.EMAIL) {
      // Send async email without blocking HTTP response
      setImmediate(async () => {
        try {
          const wholesalerMail = await emailService.sendEnquiryToWholesaler({
            wholesalerEmail: wholesalerProfile.contact_email,
            wholesalerBusinessName: wholesalerProfile.business_name,
            enquiryNo,
            retailerName: name,
            retailerEmail: email,
            retailerPhone: phone,
            retailerAddress: address,
            items: processedItems,
            message,
            dashboardUrl: `${config.clientUrl}/dashboard/enquiries`,
          });

          await emailService.sendConfirmationToRetailer({
            retailerEmail: email,
            retailerName: name,
            wholesalerBusinessName: wholesalerProfile.business_name,
            enquiryNo,
            items: processedItems,
            message,
          });

          await Enquiry.update(
            {
              email_sent: wholesalerMail.success,
              email_error: wholesalerMail.error || null,
            },
            { where: { id: enquiry.id } }
          );
        } catch (mailErr) {
          console.error('[Enquiry] Background mail error:', mailErr);
          await Enquiry.update(
            { email_sent: false, email_error: mailErr.message },
            { where: { id: enquiry.id } }
          );
        }
      });
    }

    return {
      enquiry: {
        id: enquiry.id,
        enquiry_no: enquiry.enquiry_no,
        channel: enquiry.channel,
        status: enquiry.status,
        created_at: enquiry.created_at,
      },
      whatsapp_url: whatsappUrl,
    };
  }

  async getWholesalerEnquiries(wholesalerId, query = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      channel,
      search,
    } = query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = { wholesaler_id: wholesalerId };

    if (status && Object.values(ENQUIRY_STATUSES).includes(status)) {
      where.status = status;
    }

    if (channel && Object.values(CHANNELS).includes(channel)) {
      where.channel = channel;
    }

    if (search && search.trim()) {
      where[Op.or] = [
        { enquiry_no: { [Op.iLike]: `%${search.trim()}%` } },
        { retailer_name: { [Op.iLike]: `%${search.trim()}%` } },
        { retailer_email: { [Op.iLike]: `%${search.trim()}%` } },
        { retailer_phone: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const { count, rows } = await Enquiry.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: EnquiryItem,
          as: 'items',
        },
      ],
      distinct: true,
    });

    const unreadCount = await Enquiry.count({
      where: { wholesaler_id: wholesalerId, is_read: false },
    });

    return {
      enquiries: rows,
      total: count,
      unreadCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
    };
  }

  async getWholesalerEnquiryById(id, wholesalerId) {
    const enquiry = await Enquiry.findOne({
      where: { id, wholesaler_id: wholesalerId },
      include: [
        {
          model: EnquiryItem,
          as: 'items',
        },
        {
          model: User,
          as: 'retailer',
          attributes: ['id', 'name', 'email', 'phone', 'shop_name'],
        },
      ],
    });

    if (!enquiry) {
      throw ApiError.notFound('Enquiry not found');
    }

    // Mark as read and viewed if new
    if (!enquiry.is_read) {
      enquiry.is_read = true;
      if (enquiry.status === ENQUIRY_STATUSES.NEW) {
        enquiry.status = ENQUIRY_STATUSES.VIEWED;
      }
      await enquiry.save();
    }

    return enquiry;
  }

  async updateEnquiryStatus(id, wholesalerId, { status, internal_note }) {
    const enquiry = await Enquiry.findOne({
      where: { id, wholesaler_id: wholesalerId },
    });

    if (!enquiry) {
      throw ApiError.notFound('Enquiry not found');
    }

    if (status) {
      if (!Object.values(ENQUIRY_STATUSES).includes(status)) {
        throw ApiError.badRequest('Invalid enquiry status');
      }
      enquiry.status = status;
    }

    if (internal_note !== undefined) {
      enquiry.internal_note = internal_note ? internal_note.trim() : null;
    }

    await enquiry.save();
    return enquiry;
  }

  async getRetailerEnquiries(retailerId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { count, rows } = await Enquiry.findAndCountAll({
      where: { retailer_id: retailerId },
      limit: parseInt(limit, 10),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: EnquiryItem,
          as: 'items',
        },
        {
          model: WholesalerProfile,
          as: 'wholesaler',
          attributes: ['id', 'business_name', 'slug', 'logo_url', 'contact_phone', 'whatsapp'],
        },
      ],
      distinct: true,
    });

    return {
      enquiries: rows,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
    };
  }

  async getRetailerEnquiryById(id, retailerId) {
    const enquiry = await Enquiry.findOne({
      where: { id, retailer_id: retailerId },
      include: [
        {
          model: EnquiryItem,
          as: 'items',
        },
        {
          model: WholesalerProfile,
          as: 'wholesaler',
          attributes: ['id', 'business_name', 'slug', 'logo_url', 'contact_phone', 'whatsapp', 'address'],
        },
      ],
    });

    if (!enquiry) {
      throw ApiError.notFound('Enquiry not found');
    }

    return enquiry;
  }
}

module.exports = new EnquiryService();
