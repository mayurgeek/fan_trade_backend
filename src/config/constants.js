const ROLES = {
  WHOLESALER: 'wholesaler',
  RETAILER: 'retailer',
};

const ENQUIRY_STATUSES = {
  NEW: 'new',
  VIEWED: 'viewed',
  RESPONDED: 'responded',
  CLOSED: 'closed',
};

const CHANNELS = {
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
};

const PRODUCT_AVAILABILITY = {
  IN_STOCK: 'in_stock',
  OUT_OF_STOCK: 'out_of_stock',
  MADE_TO_ORDER: 'made_to_order',
};

const RESERVED_SLUGS = [
  'admin',
  'api',
  'auth',
  'catalog',
  'explore',
  'login',
  'register',
  'dashboard',
  'public',
  'account',
  'settings',
  'static',
  'support',
  'terms',
  'privacy',
  'help',
  'about',
  'contact',
  'enquiry',
  'enquiries',
  'wholesaler',
  'retailer',
  'store',
  'shop',
];

module.exports = {
  ROLES,
  ENQUIRY_STATUSES,
  CHANNELS,
  PRODUCT_AVAILABILITY,
  RESERVED_SLUGS,
};
