const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: false,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    } else {
      // Ethereal / development mode fallback
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        auth: {
          user: 'test_user',
          pass: 'test_pass',
        },
      });
    }
  }

  formatItemsTable(items) {
    const rows = items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 500; color: #1e293b;">${item.product_name || item.productName}</td>
        <td style="padding: 10px 14px; color: #64748b;">${item.category_name || item.categoryName}</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #4338ca;">${item.quantity} ${item.unit}</td>
        <td style="padding: 10px 14px; color: #1e293b;">${item.price_snapshot ? `₹${item.price_snapshot}` : 'Price on request'}</td>
      </tr>
    `
      )
      .join('');

    return `
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; margin: 16px 0;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
            <th style="padding: 10px 14px;">Product</th>
            <th style="padding: 10px 14px;">Category</th>
            <th style="padding: 10px 14px;">Quantity</th>
            <th style="padding: 10px 14px;">Unit Price</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  async sendEnquiryToWholesaler({
    wholesalerEmail,
    wholesalerBusinessName,
    enquiryNo,
    retailerName,
    retailerEmail,
    retailerPhone,
    retailerAddress,
    items,
    message,
    dashboardUrl,
  }) {
    try {
      const itemsTable = this.formatItemsTable(items);
      const addressRow = retailerAddress && retailerAddress.trim()
        ? `<p style="margin: 4px 0; color: #334155;"><strong>Address:</strong> ${retailerAddress.trim()}</p>`
        : '';
      const messageSection = message && message.trim()
        ? `
          <div style="background-color: #f1f5f9; padding: 14px; border-radius: 8px; margin: 16px 0;">
            <strong style="color: #334155;">Message from Retailer:</strong>
            <p style="margin: 6px 0 0 0; color: #1e293b; font-style: italic;">"${message.trim()}"</p>
          </div>
        `
        : '';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Product Enquiry - ${enquiryNo}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
          <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px;">
            <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px;">
              <span style="font-size: 20px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px;">FanTrade</span>
              <h2 style="margin: 8px 0 0 0; color: #0f172a; font-size: 22px;">New Product Enquiry Received</h2>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Reference No: <strong style="color: #4f46e5;">${enquiryNo}</strong></p>
            </div>

            <p style="color: #334155; font-size: 15px;">Hello <strong>${wholesalerBusinessName}</strong>,</p>
            <p style="color: #334155; font-size: 15px;">A retailer has submitted an enquiry for your catalogue products:</p>

            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
              <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Retailer Contact</h4>
              <p style="margin: 4px 0; color: #334155;"><strong>Name:</strong> ${retailerName}</p>
              <p style="margin: 4px 0; color: #334155;"><strong>Email:</strong> <a href="mailto:${retailerEmail}" style="color: #4f46e5;">${retailerEmail}</a></p>
              <p style="margin: 4px 0; color: #334155;"><strong>Phone:</strong> <a href="tel:${retailerPhone}" style="color: #4f46e5;">${retailerPhone}</a></p>
              ${addressRow}
            </div>

            <h3 style="color: #0f172a; font-size: 16px; margin: 24px 0 8px 0;">Requested Items</h3>
            ${itemsTable}

            ${messageSection}

            <div style="text-align: center; margin: 32px 0 16px 0;">
              <a href="${dashboardUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                View in Dashboard
              </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
              This email was automatically generated by FanTrade Catalogue Platform.
            </div>
          </div>
        </body>
        </html>
      `;

      // Non-blocking mail dispatch
      if (config.email.user && config.email.pass) {
        await this.transporter.sendMail({
          from: config.email.from,
          to: wholesalerEmail,
          replyTo: retailerEmail,
          subject: `New B2B Enquiry [${enquiryNo}] from ${retailerName}`,
          html,
        });
      } else {
        console.log(`[EmailService] Dev Mock - Wholesaler email prepared for ${wholesalerEmail} (Enquiry: ${enquiryNo})`);
      }

      return { success: true };
    } catch (err) {
      console.error('[EmailService] Error sending email to wholesaler:', err.message);
      return { success: false, error: err.message };
    }
  }

  async sendConfirmationToRetailer({
    retailerEmail,
    retailerName,
    wholesalerBusinessName,
    enquiryNo,
    items,
    message,
  }) {
    try {
      const itemsTable = this.formatItemsTable(items);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Enquiry Confirmation - ${enquiryNo}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
          <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px;">
            <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px;">
              <span style="font-size: 20px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px;">FanTrade</span>
              <h2 style="margin: 8px 0 0 0; color: #0f172a; font-size: 22px;">Enquiry Sent Successfully</h2>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Reference No: <strong style="color: #10b981;">${enquiryNo}</strong></p>
            </div>

            <p style="color: #334155; font-size: 15px;">Hello <strong>${retailerName}</strong>,</p>
            <p style="color: #334155; font-size: 15px;">Your enquiry has been successfully delivered to <strong>${wholesalerBusinessName}</strong>. They will review your request and get back to you shortly.</p>

            <h3 style="color: #0f172a; font-size: 16px; margin: 24px 0 8px 0;">Summary of Enquired Items</h3>
            ${itemsTable}

            <p style="color: #64748b; font-size: 14px;">You can track the progress of all your enquiries anytime under <strong>My Enquiries</strong> in your FanTrade account.</p>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
              Thank you for using FanTrade Catalogue Platform.
            </div>
          </div>
        </body>
        </html>
      `;

      if (config.email.user && config.email.pass) {
        await this.transporter.sendMail({
          from: config.email.from,
          to: retailerEmail,
          subject: `Enquiry Confirmation [${enquiryNo}] - ${wholesalerBusinessName}`,
          html,
        });
      } else {
        console.log(`[EmailService] Dev Mock - Retailer confirmation prepared for ${retailerEmail} (Enquiry: ${enquiryNo})`);
      }

      return { success: true };
    } catch (err) {
      console.error('[EmailService] Error sending confirmation to retailer:', err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new EmailService();
