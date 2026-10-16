const { Product, ProductImage, Category, WholesalerProfile, sequelize } = require('../src/models');

async function updateImages() {
  console.log('Updating product and category images with high-resolution assets...');

  const imageMap = [
    {
      slug: 'aerovort-aeroblade-1200-bldc-fan',
      primaryUrl: '/images/products/aerovort_bldc_fan.jpg',
      categorySlug: 'bldc-energy-saving-fans',
    },
    {
      slug: 'aerovort-imperial-royal-carved-fan',
      primaryUrl: '/images/products/royal_carved_fan.jpg',
      categorySlug: 'decorative-ceiling-fans',
    },
    {
      slug: 'aerovort-tornado-1400-industrial-sweep-fan',
      primaryUrl: '/images/products/industrial_sweep_fan.jpg',
      categorySlug: 'industrial-heavy-duty-fans',
    },
    {
      slug: 'breezemaster-heritage-walnut-5-blade-fan',
      primaryUrl: '/images/products/walnut_timber_fan.jpg',
      categorySlug: 'heritage-wood-fans',
    },
    {
      slug: 'breezemaster-stormhigh-600-commercial-fan',
      primaryUrl: '/images/products/commercial_speed_fan.jpg',
      categorySlug: 'high-speed-commercial-fans',
    },
    {
      slug: 'vanguard-ergoflex-pro-mesh-task-chair',
      primaryUrl: '/images/products/ergonomic_mesh_chair.jpg',
      categorySlug: 'ergonomic-office-chairs',
    },
    {
      slug: 'vanguard-apex-modular-executive-desk-1800',
      primaryUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      categorySlug: 'executive-workstations',
    },
  ];

  for (const item of imageMap) {
    const product = await Product.findOne({ where: { slug: item.slug } });
    if (product) {
      // Update primary product image
      await ProductImage.update(
        { url: item.primaryUrl },
        { where: { product_id: product.id, is_primary: true } }
      );
      console.log(`✓ Updated image for product: ${product.name}`);
    }

    if (item.categorySlug) {
      const category = await Category.findOne({ where: { slug: item.categorySlug } });
      if (category) {
        await category.update({ image_url: item.primaryUrl });
        console.log(`✓ Updated category image: ${category.name}`);
      }
    }
  }

  // Also ensure wholesaler banner and logos are crisp
  await WholesalerProfile.update(
    {
      logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    },
    { where: { slug: 'aerovort-fans' } }
  );

  await WholesalerProfile.update(
    {
      logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    },
    { where: { slug: 'breezemaster' } }
  );

  console.log('✓ All database image updates applied successfully!');
  process.exit(0);
}

updateImages().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
