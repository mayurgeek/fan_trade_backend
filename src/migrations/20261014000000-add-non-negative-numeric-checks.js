'use strict';

async function constraintExists(queryInterface, name) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT 1 FROM pg_constraint WHERE conname = :name LIMIT 1`,
    { replacements: { name } }
  );
  return rows.length > 0;
}

async function countViolations(queryInterface, sql) {
  const [rows] = await queryInterface.sequelize.query(sql);
  return Number(rows[0]?.c || 0);
}

async function addCheckIfSafe(queryInterface, { name, table, sql, violationSql }) {
  if (await constraintExists(queryInterface, name)) {
    return;
  }
  const violations = await countViolations(queryInterface, violationSql);
  if (violations > 0) {
    console.warn(
      `[migration] Skipping CHECK ${name} on ${table}: ${violations} existing row(s) would violate it. Historical data was not rewritten.`
    );
    return;
  }
  await queryInterface.sequelize.query(sql);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await addCheckIfSafe(queryInterface, {
      name: 'products_price_non_negative',
      table: 'products',
      sql: 'ALTER TABLE products ADD CONSTRAINT products_price_non_negative CHECK (price IS NULL OR price >= 0)',
      violationSql: 'SELECT COUNT(*)::int AS c FROM products WHERE price IS NOT NULL AND price < 0',
    });

    await addCheckIfSafe(queryInterface, {
      name: 'products_moq_positive',
      table: 'products',
      sql: 'ALTER TABLE products ADD CONSTRAINT products_moq_positive CHECK (min_order_qty >= 1)',
      violationSql: 'SELECT COUNT(*)::int AS c FROM products WHERE min_order_qty < 1',
    });

    await addCheckIfSafe(queryInterface, {
      name: 'enquiry_items_qty_positive',
      table: 'enquiry_items',
      sql: 'ALTER TABLE enquiry_items ADD CONSTRAINT enquiry_items_qty_positive CHECK (quantity >= 1)',
      violationSql: 'SELECT COUNT(*)::int AS c FROM enquiry_items WHERE quantity < 1',
    });

    await addCheckIfSafe(queryInterface, {
      name: 'categories_sort_order_non_negative',
      table: 'categories',
      sql: 'ALTER TABLE categories ADD CONSTRAINT categories_sort_order_non_negative CHECK (sort_order >= 0)',
      violationSql: 'SELECT COUNT(*)::int AS c FROM categories WHERE sort_order < 0',
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_non_negative'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE products DROP CONSTRAINT IF EXISTS products_moq_positive'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE enquiry_items DROP CONSTRAINT IF EXISTS enquiry_items_qty_positive'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_sort_order_non_negative'
    );
  },
};
