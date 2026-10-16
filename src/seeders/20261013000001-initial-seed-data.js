'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Users
    const uWholesaler1Id = '11111111-1111-4111-a111-111111111111';
    const uWholesaler2Id = '22222222-2222-4222-a222-222222222222';
    const uWholesaler3Id = '33333333-3333-4333-a333-333333333333';
    const uRetailerId = '44444444-4444-4444-a444-444444444444';

    await queryInterface.bulkInsert('users', [
      {
        id: uWholesaler1Id,
        name: 'Vikram Singhania',
        email: 'aerovort@viralcatalogs.com',
        phone: '+91 98201 11223',
        password_hash: passwordHash,
        role: 'wholesaler',
        address: 'Plot 14, GIDC Industrial Estate, Sector 28',
        shop_name: 'AeroVort Ceiling Systems HQ',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uWholesaler2Id,
        name: 'Rajesh Mehta',
        email: 'breezemaster@viralcatalogs.com',
        phone: '+91 98302 22334',
        password_hash: passwordHash,
        role: 'wholesaler',
        address: 'Unit 8B, Focal Point Industrial Zone',
        shop_name: 'BreezeMaster Works',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uWholesaler3Id,
        name: 'Ananya Roy',
        email: 'vanguard@viralcatalogs.com',
        phone: '+91 98403 33445',
        password_hash: passwordHash,
        role: 'wholesaler',
        address: '702 Furniture Park, Ambattur Industrial Estate',
        shop_name: 'Vanguard Living Concepts',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uRetailerId,
        name: 'Pooja Sharma',
        email: 'pooja.electricals@gmail.com',
        phone: '+91 99104 44556',
        password_hash: passwordHash,
        role: 'retailer',
        address: 'Shop 42, Electric Market, Lohar Chawl, Mumbai, Maharashtra 400002',
        shop_name: 'Pooja Electricals & Hardware Store',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 2. Wholesaler Profiles
    const wpAeroVortId = 'ba111111-aaaa-4111-aaaa-111111111111';
    const wpBreezeMasterId = 'bb222222-bbbb-4222-bbbb-222222222222';
    const wpVanguardId = 'bc333333-cccc-4333-cccc-333333333333';

    await queryInterface.bulkInsert('wholesaler_profiles', [
      {
        id: wpAeroVortId,
        user_id: uWholesaler1Id,
        business_name: 'AeroVort Ceiling Systems',
        slug: 'aerovort-fans',
        logo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=400&q=80',
        banner_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
        about: "India's premier high-efficiency ceiling fan manufacturer specializing in BEE 5-star BLDC and designer architectural fans engineered with 100% pure copper windings.",
        contact_email: 'sales@aerovort.com',
        contact_phone: '+91 98201 11223',
        whatsapp: '+91 98201 11223', // HAS WHATSAPP
        address: 'Plot 14, GIDC Industrial Estate, Sector 28',
        city: 'Gandhinagar',
        state: 'Gujarat',
        is_published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: wpBreezeMasterId,
        user_id: uWholesaler2Id,
        business_name: 'BreezeMaster Fan Co.',
        slug: 'breezemaster',
        logo_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
        banner_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
        about: 'Crafted antique wood-finish fans and heavy-duty commercial sweep fans engineered for durability and whisper-quiet airflow. High volume B2B supplies.',
        contact_email: 'breezemasterfans@gmail.com',
        contact_phone: '+91 98302 22334',
        whatsapp: null, // NO WHATSAPP - Tests WhatsApp disabled state & 422!
        address: 'Unit 8B, Focal Point Industrial Zone',
        city: 'Ludhiana',
        state: 'Punjab',
        is_published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: wpVanguardId,
        user_id: uWholesaler3Id,
        business_name: 'Vanguard Office & Living Furniture',
        slug: 'vanguard-furniture',
        logo_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
        banner_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80',
        about: 'High-durability ergonomic seating, executive desks, and modular institutional workstations for commercial architects, institutions, and retailers.',
        contact_email: 'b2b@vanguardfurniture.in',
        contact_phone: '+91 98403 33445',
        whatsapp: '+91 98403 33445', // HAS WHATSAPP
        address: '702 Furniture Park, Ambattur Industrial Estate',
        city: 'Chennai',
        state: 'Tamil Nadu',
        is_published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 3. Categories
    const catAeroBldcId = 'ca111111-0001-4111-8001-111111111111';
    const catAeroDecId = 'ca111111-0002-4111-8002-111111111111';
    const catAeroIndId = 'ca111111-0003-4111-8003-111111111111';

    const catBreezeWoodId = 'cb222222-0001-4222-8001-222222222222';
    const catBreezeCommId = 'cb222222-0002-4222-8002-222222222222';

    const catVanChairsId = 'cc333333-0001-4333-8001-333333333333';
    const catVanDesksId = 'cc333333-0002-4333-8002-333333333333';

    await queryInterface.bulkInsert('categories', [
      {
        id: catAeroBldcId,
        wholesaler_id: wpAeroVortId,
        name: 'BLDC Energy Saving Fans',
        slug: 'bldc-energy-saving-fans',
        description: 'Super-efficient 28W BLDC motors with 6-speed smart remote control.',
        image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: catAeroDecId,
        wholesaler_id: wpAeroVortId,
        name: 'Decorative Ceiling Fans',
        slug: 'decorative-ceiling-fans',
        description: 'Architectural finishes, antique brass coatings, and integrated warm underlights.',
        image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: catAeroIndId,
        wholesaler_id: wpAeroVortId,
        name: 'Industrial Heavy Duty Fans',
        slug: 'industrial-heavy-duty-fans',
        description: 'Heavy CRCA steel body with continuous 24x7 heavy air delivery for commercial sheds.',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: catBreezeWoodId,
        wholesaler_id: wpBreezeMasterId,
        name: 'Antique Wood Finish Fans',
        slug: 'antique-wood-finish-fans',
        description: 'Hand-buffed natural timber and walnut grain blades with rustic metallic bodies.',
        image_url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=600&q=80',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: catBreezeCommId,
        wholesaler_id: wpBreezeMasterId,
        name: 'High-Speed Commercial Fans',
        slug: 'high-speed-commercial-fans',
        description: '800+ RPM high-speed sweep fans built for quick cooling in busy commercial spaces.',
        image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: catVanChairsId,
        wholesaler_id: wpVanguardId,
        name: 'Ergonomic Office Chairs',
        slug: 'ergonomic-office-chairs',
        description: 'BIFMA-certified breathable mesh high-back chairs with adjustable lumbar support.',
        image_url: 'https://images.unsplash.com/photo-1580481077195-c3a8b415e982?auto=format&fit=crop&w=600&q=80',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: catVanDesksId,
        wholesaler_id: wpVanguardId,
        name: 'Modular Executive Desks',
        slug: 'modular-executive-desks',
        description: 'Heavy gauge steel framed desks with pre-routed wire managers and natural oak tops.',
        image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 4. Products
    const prodAeroBladeId = 'da111111-0001-4111-8001-111111111111';
    const prodAeroRoyalId = 'da111111-0002-4111-8002-111111111111';
    const prodAeroTornadoId = 'da111111-0003-4111-8003-111111111111';

    const prodBreezeWalnutId = 'db222222-0001-4222-8001-222222222222';
    const prodBreezeStormId = 'db222222-0002-4222-8002-222222222222';

    const prodVanErgoId = 'dc333333-0001-4333-8001-333333333333';
    const prodVanDeskId = 'dc333333-0002-4333-8002-333333333333';

    await queryInterface.bulkInsert('products', [
      {
        id: prodAeroBladeId,
        wholesaler_id: wpAeroVortId,
        category_id: catAeroBldcId,
        name: 'AeroVort AeroBlade 1200 BLDC Fan',
        slug: 'aerovort-aeroblade-1200-bldc-fan',
        description: 'Engineered for exceptional 65% power reduction without compromising air blast. Equipped with intelligent sleep and boost timer modes.',
        sku: 'AV-BLDC-1200',
        price: 2850.0,
        unit: 'Piece',
        min_order_qty: 10,
        availability: 'in_stock',
        specifications: JSON.stringify([
          { key: 'Sweep Size', value: '1200 mm (48 inch)' },
          { key: 'Rated Power', value: '28 Watts' },
          { key: 'RPM', value: '370 RPM' },
          { key: 'Air Delivery', value: '235 CMM' },
          { key: 'Motor Type', value: '100% Copper Brushless DC' },
          { key: 'Speed Control', value: '6-Speed Smart RF Remote' },
          { key: 'Star Rating', value: 'BEE 5-Star Certified' },
          { key: 'Warranty', value: '3 Years On-Site Replacement' },
        ]),
        is_active: true,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: prodAeroRoyalId,
        wholesaler_id: wpAeroVortId,
        category_id: catAeroDecId,
        name: 'AeroVort Imperial Royal Carved Fan',
        slug: 'aerovort-imperial-royal-carved-fan',
        description: 'Exquisite royal heritage design with intricate brass blade shanks and a multi-tiered crystal warm underlight dome.',
        sku: 'AV-DEC-ROYAL',
        price: 4200.0,
        unit: 'Piece',
        min_order_qty: 5,
        availability: 'in_stock',
        specifications: JSON.stringify([
          { key: 'Sweep Size', value: '1320 mm (52 inch)' },
          { key: 'Finish', value: 'Antique Brass with Rosewood Polish' },
          { key: 'RPM', value: '320 RPM' },
          { key: 'Air Delivery', value: '240 CMM' },
          { key: 'Blades', value: '5 Handcrafted Engineered Wood Blades' },
          { key: 'Underlight', value: 'Tri-Tone Dimmable LED Chandelier' },
          { key: 'Warranty', value: '2 Years Manufacturer Warranty' },
        ]),
        is_active: true,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: prodAeroTornadoId,
        wholesaler_id: wpAeroVortId,
        category_id: catAeroIndId,
        name: 'AeroVort Tornado 1400 Industrial Sweep Fan',
        slug: 'aerovort-tornado-1400-industrial-sweep-fan',
        description: 'Heavy duty high-velocity fan built for workshops, logistics warehouses, and agricultural ventilation. Non-stop 24x7 endurance.',
        sku: 'AV-IND-1400',
        price: null, // Price on request!
        unit: 'Piece',
        min_order_qty: 20,
        availability: 'made_to_order',
        specifications: JSON.stringify([
          { key: 'Sweep Size', value: '1400 mm (56 inch)' },
          { key: 'Motor Core', value: 'Heavy Gauge Double Ball Bearing Copper' },
          { key: 'RPM', value: '410 RPM' },
          { key: 'Air Delivery', value: '280 CMM' },
          { key: 'Blades', value: 'Heavy CRCA Cold Pressed Steel' },
          { key: 'Duty Rating', value: 'Continuous 24x7 Rated' },
          { key: 'Warranty', value: '1 Year Industrial Replacement' },
        ]),
        is_active: true,
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: prodBreezeWalnutId,
        wholesaler_id: wpBreezeMasterId,
        category_id: catBreezeWoodId,
        name: 'BreezeMaster Heritage Walnut 5-Blade Fan',
        slug: 'breezemaster-heritage-walnut-5-blade-fan',
        description: 'Authentic warm timber aesthetics paired with a balanced quiet-glide motor. Specially designed for luxury villas and boutique hotels.',
        sku: 'BM-HER-5B',
        price: 3650.0,
        unit: 'Piece',
        min_order_qty: 8,
        availability: 'in_stock',
        specifications: JSON.stringify([
          { key: 'Sweep Size', value: '1200 mm (48 inch)' },
          { key: 'Finish', value: 'Smoked Walnut & Satin Black Metal' },
          { key: 'RPM', value: '350 RPM' },
          { key: 'Air Delivery', value: '225 CMM' },
          { key: 'Motor', value: 'WhisperQuiet 14-Pole Heavy Core' },
          { key: 'Warranty', value: '2 Years Replacement Warranty' },
        ]),
        is_active: true,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: prodBreezeStormId,
        wholesaler_id: wpBreezeMasterId,
        category_id: catBreezeCommId,
        name: 'BreezeMaster StormHigh 600 Commercial Fan',
        slug: 'breezemaster-stormhigh-600-commercial-fan',
        description: 'Ultra high-speed commercial ceiling sweep fan designed for instant cooling in fast-paced retail shops, tuition centers, and clinics.',
        sku: 'BM-SH-600',
        price: 1980.0,
        unit: 'Piece',
        min_order_qty: 15,
        availability: 'in_stock',
        specifications: JSON.stringify([
          { key: 'Sweep Size', value: '600 mm (24 inch)' },
          { key: 'Speed', value: '840 Ultra-High RPM' },
          { key: 'Air Delivery', value: '185 CMM' },
          { key: 'Finish', value: 'Glossy Electrostatic Powder Coated' },
          { key: 'Application', value: 'Commercial Halls, Canteens, Clinics' },
          { key: 'Warranty', value: '2 Years Manufacturer Warranty' },
        ]),
        is_active: true,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: prodVanErgoId,
        wholesaler_id: wpVanguardId,
        category_id: catVanChairsId,
        name: 'Vanguard Ergoflex Pro Mesh Task Chair',
        slug: 'vanguard-ergoflex-pro-mesh-task-chair',
        description: 'Industry-agnostic proof: High resilience ergonomic office seating with German mesh, multi-locking tilt mechanism and adjustable lumbar.',
        sku: 'VG-CH-ERGO',
        price: 5400.0,
        unit: 'Piece',
        min_order_qty: 5,
        availability: 'in_stock',
        specifications: JSON.stringify([
          { key: 'Mechanism', value: 'Synchro-Tilt with Multi-Locking Positions' },
          { key: 'Lumbar Support', value: '2D Depth & Height Adjustable' },
          { key: 'Gas Lift', value: 'Class 4 Heavy Duty Nitrogen Cylinder' },
          { key: 'Base', value: '350mm Die-Cast Polished Aluminum Alloy' },
          { key: 'Weight Capacity', value: '140 kg Certified' },
          { key: 'Warranty', value: '3 Years Comprehensive Warranty' },
        ]),
        is_active: true,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: prodVanDeskId,
        wholesaler_id: wpVanguardId,
        category_id: catVanDesksId,
        name: 'Vanguard Apex Modular Executive Desk 1800',
        slug: 'vanguard-apex-modular-executive-desk-1800',
        description: 'Robust modern executive workstation featuring pre-routed dual raceway cable trunks and scratch-resistant natural oak finish.',
        sku: 'VG-DSK-1800',
        price: 14800.0,
        unit: 'Set',
        min_order_qty: 2,
        availability: 'made_to_order',
        specifications: JSON.stringify([
          { key: 'Dimensions', value: '1800mm W x 800mm D x 750mm H' },
          { key: 'Top Material', value: '25mm Pre-Laminated Engineered Board' },
          { key: 'Frame', value: 'Heavy Duty 50x50mm Steel Tube Structure' },
          { key: 'Wire Management', value: 'Flip-Top Aluminum Brush Raceway' },
          { key: 'Finish', value: 'Natural Oak with Charcoal Grey Legs' },
          { key: 'Warranty', value: '5 Years Structural Warranty' },
        ]),
        is_active: true,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 5. Product Images
    await queryInterface.bulkInsert('product_images', [
      {
        id: 'ea111111-0001-4111-8001-111111111111',
        product_id: prodAeroBladeId,
        url: '/images/products/aerovort_bldc_fan.jpg',
        public_id: null,
        is_primary: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'ea111111-0001-4111-8002-111111111111',
        product_id: prodAeroBladeId,
        url: '/images/products/aerovort_bldc_fan.jpg',
        public_id: null,
        is_primary: false,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'ea111111-0002-4111-8001-111111111111',
        product_id: prodAeroRoyalId,
        url: '/images/products/royal_carved_fan.jpg',
        public_id: null,
        is_primary: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'ea111111-0003-4111-8001-111111111111',
        product_id: prodAeroTornadoId,
        url: '/images/products/industrial_sweep_fan.jpg',
        public_id: null,
        is_primary: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'eb222222-0001-4222-8001-222222222222',
        product_id: prodBreezeWalnutId,
        url: '/images/products/walnut_timber_fan.jpg',
        public_id: null,
        is_primary: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'eb222222-0002-4222-8001-222222222222',
        product_id: prodBreezeStormId,
        url: '/images/products/commercial_speed_fan.jpg',
        public_id: null,
        is_primary: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'ec333333-0001-4333-8001-333333333333',
        product_id: prodVanErgoId,
        url: '/images/products/ergonomic_mesh_chair.jpg',
        public_id: null,
        is_primary: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'ec333333-0002-4333-8002-333333333333',
        product_id: prodVanDeskId,
        url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
        public_id: null,
        is_primary: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 6. Sample Initial Enquiry
    const sampleEnqId = 'fa111111-0001-4111-8001-111111111111';
    await queryInterface.bulkInsert('enquiries', [
      {
        id: sampleEnqId,
        enquiry_no: 'ENQ-2026-000101',
        wholesaler_id: wpAeroVortId,
        retailer_id: uRetailerId,
        channel: 'whatsapp',
        retailer_name: 'Pooja Sharma',
        retailer_email: 'pooja.electricals@gmail.com',
        retailer_phone: '+91 99104 44556',
        retailer_address: 'Shop 42, Electric Market, Lohar Chawl, Mumbai, Maharashtra 400002',
        message: 'Looking for a wholesale trial lot of 20 units of AeroBlade 1200 BLDC fans for our Diwali retail inventory.',
        status: 'new',
        internal_note: 'Verified retailer from Mumbai electrical market. Call on Wednesday.',
        is_read: false,
        email_sent: false,
        email_error: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('enquiry_items', [
      {
        id: 'fb111111-0001-4111-8001-111111111111',
        enquiry_id: sampleEnqId,
        product_id: prodAeroBladeId,
        product_name: 'AeroVort AeroBlade 1200 BLDC Fan',
        category_name: 'BLDC Energy Saving Fans',
        quantity: 20,
        unit: 'Piece',
        price_snapshot: 2850.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('enquiry_items', null, {});
    await queryInterface.bulkDelete('enquiries', null, {});
    await queryInterface.bulkDelete('product_images', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('wholesaler_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
