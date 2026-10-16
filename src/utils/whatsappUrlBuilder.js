const config = require('../config');

/**
 * Normalizes phone number into international digits-only format
 * e.g., "+91 98765-43210" -> "919876543210"
 * "9876543210" -> "919876543210" (when defaultCountryCode = 91)
 */
const normalizePhoneNumber = (rawNumber, defaultCountryCode = config.business.defaultCountryCode) => {
  if (!rawNumber) return '';
  let digits = String(rawNumber).replace(/\D/g, '');
  // Strip leading zeroes (e.g. 09876543210 -> 9876543210)
  digits = digits.replace(/^0+/, '');

  if (digits.length === 10) {
    digits = `${defaultCountryCode}${digits}`;
  }
  return digits;
};

/**
 * Formats enquiry items into WhatsApp message format
 */
const formatItemsText = (items, includeUrls = true, maxItems = items.length, enquiryNo = '') => {
  const visibleItems = items.slice(0, maxItems);
  const itemsTextList = visibleItems.map((item, idx) => {
    let text = `${idx + 1}. ${item.productName} (${item.categoryName}) - Qty: ${item.quantity} ${item.unit}`;
    if (includeUrls && item.productUrl) {
      text += `\n   ${item.productUrl}`;
    }
    return text;
  });

  let fullItemsText = itemsTextList.join('\n');
  if (items.length > maxItems) {
    const remaining = items.length - maxItems;
    fullItemsText += `\n+${remaining} more items, see Ref ${enquiryNo}`;
  }

  return fullItemsText;
};

/**
 * Builds the complete WhatsApp message text
 */
const renderMessageBody = ({
  businessName,
  enquiryNo,
  items,
  retailerName,
  retailerEmail,
  retailerPhone,
  retailerAddress,
  message,
  includeUrls = true,
  maxItems = items.length,
}) => {
  const itemsSection = formatItemsText(items, includeUrls, maxItems, enquiryNo);

  let detailsText = `Name: ${retailerName}\nEmail: ${retailerEmail}\nPhone: ${retailerPhone}`;
  if (retailerAddress && retailerAddress.trim()) {
    detailsText += `\nAddress: ${retailerAddress.trim()}`;
  }

  let body = `Hello ${businessName}, I would like to enquire about these products. (Ref: ${enquiryNo})\n\n*Products*\n${itemsSection}\n\n*My details*\n${detailsText}`;

  if (message && message.trim()) {
    body += `\n\nMessage: ${message.trim()}`;
  }

  body += '\n\nThank you.';
  return body;
};

/**
 * Builds the wa.me URL, ensuring encoded length is <= 1800 characters
 */
const buildWhatsAppUrl = ({
  phoneNumber,
  businessName,
  enquiryNo,
  items,
  retailerName,
  retailerEmail,
  retailerPhone,
  retailerAddress,
  message,
}) => {
  const digits = normalizePhoneNumber(phoneNumber);
  if (!digits) {
    return null;
  }

  const MAX_URL_LENGTH = 1800;
  const baseUrl = `https://wa.me/${digits}?text=`;

  // Step 1: Try with full URLs
  let text = renderMessageBody({
    businessName,
    enquiryNo,
    items,
    retailerName,
    retailerEmail,
    retailerPhone,
    retailerAddress,
    message,
    includeUrls: true,
    maxItems: items.length,
  });

  let fullUrl = baseUrl + encodeURIComponent(text);
  if (fullUrl.length <= MAX_URL_LENGTH) {
    return fullUrl;
  }

  // Step 2: Drop per-item product URLs
  text = renderMessageBody({
    businessName,
    enquiryNo,
    items,
    retailerName,
    retailerEmail,
    retailerPhone,
    retailerAddress,
    message,
    includeUrls: false,
    maxItems: items.length,
  });

  fullUrl = baseUrl + encodeURIComponent(text);
  if (fullUrl.length <= MAX_URL_LENGTH) {
    return fullUrl;
  }

  // Step 3: Gradually reduce item count and append "+X more items, see Ref {enquiry_no}"
  let currentCount = items.length - 1;
  while (currentCount >= 1) {
    text = renderMessageBody({
      businessName,
      enquiryNo,
      items,
      retailerName,
      retailerEmail,
      retailerPhone,
      retailerAddress,
      message,
      includeUrls: false,
      maxItems: currentCount,
    });

    fullUrl = baseUrl + encodeURIComponent(text);
    if (fullUrl.length <= MAX_URL_LENGTH) {
      return fullUrl;
    }
    currentCount--;
  }

  return fullUrl;
};

module.exports = {
  normalizePhoneNumber,
  buildWhatsAppUrl,
};
