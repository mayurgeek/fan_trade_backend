const { Op } = require('sequelize');
const { WholesalerProfile, Product, Category, Enquiry, EnquiryItem, User } = require('../models');
const ApiError = require('../utils/apiError');
const { generateSlug, isSlugReserved, isValidSlug } = require('../utils/slugHelpers');
const { normalizePhoneNumber } = require('../utils/whatsappUrlBuilder');

class WholesalerService {
  async getProfile(userId) {
    const profile = await WholesalerProfile.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });

    if (!profile) {
      throw ApiError.notFound('Wholesaler profile not found');
    }

    return profile;
  }

  async checkSlugAvailability(slug, currentWholesalerId = null) {
    const formatted = generateSlug(slug);

    if (!formatted) {
      return { available: false, reason: 'Slug cannot be empty' };
    }

    if (!isValidSlug(formatted)) {
      return { available: false, reason: 'Slug contains invalid characters. Use letters, numbers, and hyphens only.' };
    }

    if (isSlugReserved(formatted)) {
      return { available: false, reason: `'${formatted}' is a reserved URL keyword and cannot be used.` };
    }

    const whereClause = { slug: formatted };
    if (currentWholesalerId) {
      whereClause.id = { [Op.ne]: currentWholesalerId };
    }

    const existing = await WholesalerProfile.findOne({ where: whereClause });
    if (existing) {
      return { available: false, reason: 'This slug is already taken by another wholesaler.' };
    }

    return { available: true, slug: formatted };
  }

  async updateProfile(userId, data) {
    const profile = await WholesalerProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw ApiError.notFound('Wholesaler profile not found');
    }

    // Check slug if changing
    if (data.slug && data.slug !== profile.slug) {
      const check = await this.checkSlugAvailability(data.slug, profile.id);
      if (!check.available) {
        throw ApiError.badRequest(check.reason);
      }
      profile.slug = check.slug;
    }

    if (data.business_name) profile.business_name = data.business_name.trim();
    if (data.about !== undefined) profile.about = data.about ? data.about.trim() : null;
    if (data.contact_email) profile.contact_email = data.contact_email.trim();
    if (data.contact_phone) profile.contact_phone = data.contact_phone.trim();

    if (data.whatsapp !== undefined) {
      profile.whatsapp = data.whatsapp ? data.whatsapp.trim() : null;
    }

    if (data.logo_url !== undefined) profile.logo_url = data.logo_url;
    if (data.banner_url !== undefined) profile.banner_url = data.banner_url;
    if (data.address !== undefined) profile.address = data.address ? data.address.trim() : null;
    if (data.city !== undefined) profile.city = data.city ? data.city.trim() : null;
    if (data.state !== undefined) profile.state = data.state ? data.state.trim() : null;
    if (data.is_published !== undefined) profile.is_published = Boolean(data.is_published);

    await profile.save();
    return profile;
  }

  async getDashboardStats(wholesalerId) {
    const [totalProducts, totalCategories, totalEnquiries, newEnquiries, recentEnquiries] =
      await Promise.all([
        Product.count({ where: { wholesaler_id: wholesalerId } }),
        Category.count({ where: { wholesaler_id: wholesalerId } }),
        Enquiry.count({ where: { wholesaler_id: wholesalerId } }),
        Enquiry.count({ where: { wholesaler_id: wholesalerId, status: 'new' } }),
        Enquiry.findAll({
          where: { wholesaler_id: wholesalerId },
          order: [['created_at', 'DESC']],
          limit: 5,
          include: [
            {
              model: EnquiryItem,
              as: 'items',
            },
          ],
        }),
      ]);

    return {
      totalProducts,
      totalCategories,
      totalEnquiries,
      newEnquiries,
      recentEnquiries,
    };
  }
}

module.exports = new WholesalerService();
