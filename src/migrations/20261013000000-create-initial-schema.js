'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('wholesaler', 'retailer'),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      shop_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 2. Wholesaler Profiles table
    await queryInterface.createTable('wholesaler_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      business_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      logo_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      banner_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      about: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      whatsapp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 3. Categories table
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      wholesaler_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'wholesaler_profiles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('categories', {
      fields: ['wholesaler_id', 'slug'],
      type: 'unique',
      name: 'unique_wholesaler_category_slug',
    });

    // 4. Products table
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      wholesaler_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'wholesaler_profiles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      unit: {
        type: Sequelize.STRING,
        defaultValue: 'Piece',
      },
      min_order_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      availability: {
        type: Sequelize.ENUM('in_stock', 'out_of_stock', 'made_to_order'),
        defaultValue: 'in_stock',
      },
      specifications: {
        type: Sequelize.JSONB,
        defaultValue: '[]',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('products', {
      fields: ['wholesaler_id', 'slug'],
      type: 'unique',
      name: 'unique_wholesaler_product_slug',
    });

    await queryInterface.addIndex('products', ['wholesaler_id'], {
      name: 'idx_products_wholesaler_id',
    });
    await queryInterface.addIndex('products', ['category_id'], {
      name: 'idx_products_category_id',
    });
    await queryInterface.addIndex('products', ['is_active'], {
      name: 'idx_products_is_active',
    });

    // 5. Product Images table
    await queryInterface.createTable('product_images', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      public_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 6. Enquiries table
    await queryInterface.createTable('enquiries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      enquiry_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      wholesaler_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'wholesaler_profiles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      retailer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      channel: {
        type: Sequelize.ENUM('email', 'whatsapp'),
        allowNull: false,
      },
      retailer_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      retailer_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      retailer_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      retailer_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('new', 'viewed', 'responded', 'closed'),
        defaultValue: 'new',
      },
      internal_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('enquiries', ['wholesaler_id'], {
      name: 'idx_enquiries_wholesaler_id',
    });
    await queryInterface.addIndex('enquiries', ['retailer_id'], {
      name: 'idx_enquiries_retailer_id',
    });
    await queryInterface.addIndex('enquiries', ['status'], {
      name: 'idx_enquiries_status',
    });
    await queryInterface.addIndex('enquiries', ['channel'], {
      name: 'idx_enquiries_channel',
    });
    await queryInterface.addIndex('enquiries', ['created_at'], {
      name: 'idx_enquiries_created_at',
    });

    // 7. Enquiry Items table
    await queryInterface.createTable('enquiry_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      enquiry_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'enquiries',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price_snapshot: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 8. Refresh Tokens table
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('enquiry_items');
    await queryInterface.dropTable('enquiries');
    await queryInterface.dropTable('product_images');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('wholesaler_profiles');
    await queryInterface.dropTable('users');

    // Clean up enums in postgres
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_products_availability";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_enquiries_channel";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_enquiries_status";');
  },
};
