const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, WholesalerProfile, RefreshToken, sequelize } = require('../models');
const ApiError = require('../utils/apiError');
const { generateSlug, isSlugReserved } = require('../utils/slugHelpers');
const { ROLES } = require('../config/constants');
const config = require('../config');

class AuthService {
  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    });

    return { accessToken, refreshToken };
  }

  async register({
    name,
    email,
    phone,
    password,
    role,
    shop_name,
    address,
    business_name,
    slug,
  }) {
    // Check if user exists
    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    if (![ROLES.WHOLESALER, ROLES.RETAILER].includes(role)) {
      throw ApiError.badRequest('Invalid role specified. Must be wholesaler or retailer.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return await sequelize.transaction(async (t) => {
      const user = await User.create(
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password_hash: passwordHash,
          role,
          shop_name: shop_name ? shop_name.trim() : null,
          address: address ? address.trim() : null,
          last_login_at: new Date(),
        },
        { transaction: t }
      );

      let wholesalerProfile = null;

      if (role === ROLES.WHOLESALER) {
        const bName = business_name ? business_name.trim() : `${name.trim()}'s Catalogue`;
        let desiredSlug = slug ? generateSlug(slug) : generateSlug(bName);

        if (!desiredSlug || isSlugReserved(desiredSlug)) {
          desiredSlug = `${desiredSlug || 'store'}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // Ensure uniqueness
        let existingSlug = await WholesalerProfile.findOne({
          where: { slug: desiredSlug },
          transaction: t,
        });

        if (existingSlug) {
          desiredSlug = `${desiredSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        wholesalerProfile = await WholesalerProfile.create(
          {
            user_id: user.id,
            business_name: bName,
            slug: desiredSlug,
            contact_email: user.email,
            contact_phone: user.phone,
            whatsapp: user.phone,
            is_published: true,
          },
          { transaction: t }
        );
      }

      const tokens = this.generateTokens(user);

      // Save refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await RefreshToken.create(
        {
          user_id: user.id,
          token: tokens.refreshToken,
          expires_at: expiresAt,
        },
        { transaction: t }
      );

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          shop_name: user.shop_name,
          address: user.address,
          wholesalerProfile: wholesalerProfile
            ? {
                id: wholesalerProfile.id,
                business_name: wholesalerProfile.business_name,
                slug: wholesalerProfile.slug,
                is_published: wholesalerProfile.is_published,
              }
            : null,
        },
        tokens,
      };
    });
  }

  async login({ email, password }) {
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [
        {
          model: WholesalerProfile,
          as: 'wholesalerProfile',
        },
      ],
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.is_active) {
      throw ApiError.forbidden('Your account is currently suspended. Please contact support.');
    }

    const valid = await user.isValidPassword(password);
    if (!valid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    user.last_login_at = new Date();
    await user.save();

    const tokens = this.generateTokens(user);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.id,
      token: tokens.refreshToken,
      expires_at: expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        shop_name: user.shop_name,
        address: user.address,
        wholesalerProfile: user.wholesalerProfile
          ? {
              id: user.wholesalerProfile.id,
              business_name: user.wholesalerProfile.business_name,
              slug: user.wholesalerProfile.slug,
              logo_url: user.wholesalerProfile.logo_url,
              banner_url: user.wholesalerProfile.banner_url,
              is_published: user.wholesalerProfile.is_published,
              whatsapp: user.wholesalerProfile.whatsapp,
              contact_phone: user.wholesalerProfile.contact_phone,
            }
          : null,
      },
      tokens,
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const tokenDoc = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        user_id: decoded.id,
        revoked: false,
      },
    });

    if (!tokenDoc || new Date() > tokenDoc.expires_at) {
      throw ApiError.unauthorized('Refresh token revoked or expired');
    }

    // Revoke old token
    tokenDoc.revoked = true;
    await tokenDoc.save();

    const user = await User.findByPk(decoded.id, {
      include: [{ model: WholesalerProfile, as: 'wholesalerProfile' }],
    });

    if (!user || !user.is_active) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    const tokens = this.generateTokens(user);

    // Create new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.id,
      token: tokens.refreshToken,
      expires_at: expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        shop_name: user.shop_name,
        address: user.address,
        wholesalerProfile: user.wholesalerProfile
          ? {
              id: user.wholesalerProfile.id,
              business_name: user.wholesalerProfile.business_name,
              slug: user.wholesalerProfile.slug,
              is_published: user.wholesalerProfile.is_published,
            }
          : null,
      },
      tokens,
    };
  }

  async logout(userId, refreshToken) {
    if (refreshToken) {
      await RefreshToken.update(
        { revoked: true },
        { where: { token: refreshToken, user_id: userId } }
      );
    }
  }

  async getMe(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: WholesalerProfile, as: 'wholesalerProfile' }],
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async updateProfile(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (data.name) user.name = data.name.trim();
    if (data.phone) user.phone = data.phone.trim();
    if (data.address !== undefined) user.address = data.address ? data.address.trim() : null;
    if (data.shop_name !== undefined) user.shop_name = data.shop_name ? data.shop_name.trim() : null;

    await user.save();
    return this.getMe(userId);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const valid = await user.isValidPassword(currentPassword);
    if (!valid) {
      throw ApiError.badRequest('Current password does not match');
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Revoke all existing refresh tokens
    await RefreshToken.update({ revoked: true }, { where: { user_id: userId } });
  }
}

module.exports = new AuthService();
