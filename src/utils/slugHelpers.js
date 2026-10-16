const slugify = require('slugify');
const { RESERVED_SLUGS } = require('../config/constants');

const generateSlug = (text) => {
  if (!text) return '';
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

const isSlugReserved = (slug) => {
  if (!slug) return true;
  return RESERVED_SLUGS.includes(slug.toLowerCase().trim());
};

const isValidSlug = (slug) => {
  if (!slug) return false;
  const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return regex.test(slug);
};

module.exports = {
  generateSlug,
  isSlugReserved,
  isValidSlug,
};
