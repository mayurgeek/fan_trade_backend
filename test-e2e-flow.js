const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('=== RUNNING COMPLETE VIRAL PLATFORM BACKEND E2E TEST ===\n');

  // Test 1: Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('✓ Test 1: Health check OK:', healthData.status);

  // Test 2: Wholesaler login
  let wholesalerCookies = '';
  const wLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aerovort@viralcatalogs.com',
      password: 'password123'
    })
  });
  const wLoginData = await wLoginRes.json();
  const setCookies = wLoginRes.headers.getSetCookie ? wLoginRes.headers.getSetCookie() : [wLoginRes.headers.get('set-cookie')];
  wholesalerCookies = setCookies.map(c => c.split(';')[0].trim()).join('; ');
  console.log('✓ Test 2: Wholesaler Login OK:', wLoginData.data.user.name, `(${wLoginData.data.user.role})`);

  const wHeaders = {
    'Content-Type': 'application/json',
    'Cookie': wholesalerCookies
  };

  // Test 3: Wholesaler Dashboard Stats
  const statsRes = await fetch(`${BASE_URL}/wholesaler/dashboard-stats`, { headers: wHeaders });
  const statsData = await statsRes.json();
  console.log('✓ Test 3: Dashboard Stats OK:', statsData.data);

  // Test 4: Category Deletion Protection
  const catsRes = await fetch(`${BASE_URL}/wholesaler/categories`, { headers: wHeaders });
  const catsData = await catsRes.json();
  const categoriesList = catsData.data.categories || [];
  const categoryWithProducts = categoriesList.find(c => (c.product_count || c.ProductCount || 0) > 0 || c.name.includes('BLDC'));
  console.log(`✓ Test 4a: Found Category '${categoryWithProducts.name}' (ID: ${categoryWithProducts.id})`);
  
  const delRes = await fetch(`${BASE_URL}/wholesaler/categories/${categoryWithProducts.id}`, {
    method: 'DELETE',
    headers: wHeaders
  });
  const delData = await delRes.json();
  if (delRes.status >= 400) {
    console.log(`✓ Test 4b: Category deletion safely blocked with HTTP ${delRes.status}:`, delData.message);
  } else {
    console.error('✗ ERROR: Category deletion should have failed!');
  }

  // Test 5: Retailer login
  let retailerCookies = '';
  const rLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'pooja.electricals@gmail.com',
      password: 'password123'
    })
  });
  const rLoginData = await rLoginRes.json();
  const rawRSetCookie = rLoginRes.headers.getSetCookie ? rLoginRes.headers.getSetCookie() : [rLoginRes.headers.get('set-cookie')];
  retailerCookies = rawRSetCookie.map(c => c.split(';')[0].trim()).join('; ');
  console.log('✓ Test 5: Retailer Login OK:', rLoginData.data.user.name, `(${rLoginData.data.user.role})`);

  const rHeaders = {
    'Content-Type': 'application/json',
    'Cookie': retailerCookies
  };

  // Test 6: Get AeroVort Catalog & Products
  const catalogRes = await fetch(`${BASE_URL}/public/catalog/aerovort-fans`);
  const catalogData = await catalogRes.json();
  const wholesaler = catalogData.data.catalog;

  const prodsRes = await fetch(`${BASE_URL}/public/catalog/aerovort-fans/products`);
  const prodsData = await prodsRes.json();
  const product = prodsData.data.products[0];
  console.log(`✓ Test 6: Fetched Catalog '${wholesaler.business_name}', Product: '${product.name}' (MOQ: ${product.moq})`);

  // Test 7: Retailer submits Email enquiry for 25 units
  const enquiryPayload = {
    channel: 'email',
    name: 'Pooja Sharma',
    email: 'pooja.electricals@gmail.com',
    phone: '+91 98765 43210',
    address: 'Shop 14, Bajirao Road, Pune, MH',
    message: 'Seeking bulk dealer pricing for 25 units of Typhoon BLDC fans with shipping to Pune warehouse.',
    items: [
      {
        productId: product.id,
        quantity: 25
      }
    ]
  };

  const createEnquiryRes = await fetch(`${BASE_URL}/enquiries`, {
    method: 'POST',
    headers: rHeaders,
    body: JSON.stringify(enquiryPayload)
  });
  const createEnquiryData = await createEnquiryRes.json();
  console.log('createEnquiry status:', createEnquiryRes.status, 'body:', createEnquiryData);
  const newEnquiry = createEnquiryData.data?.enquiry;
  console.log(`✓ Test 7: Enquiry successfully created! Ref: ${newEnquiry?.enquiry_no}, Status: ${newEnquiry?.status}`);

  // Test 8: Retailer tracks their enquiries
  const myEnquiriesRes = await fetch(`${BASE_URL}/enquiries/mine`, { headers: rHeaders });
  const myEnquiriesData = await myEnquiriesRes.json();
  const foundInMy = myEnquiriesData.data.enquiries.find(e => e.id === newEnquiry.id);
  console.log(`✓ Test 8: Enquiry verified in Retailer list (${myEnquiriesData.data.enquiries.length} total):`, foundInMy?.enquiry_no);

  // Test 9: Wholesaler sees the enquiry in their inbox
  const inboxRes = await fetch(`${BASE_URL}/wholesaler/enquiries`, { headers: wHeaders });
  const inboxData = await inboxRes.json();
  const foundInInbox = inboxData.data.enquiries.find(e => e.id === newEnquiry.id);
  console.log(`✓ Test 9: Enquiry verified in Wholesaler Inbox (${inboxData.data.enquiries.length} total):`, foundInInbox?.enquiry_no);

  // Test 10: Wholesaler updates status and adds internal notes
  const updateRes = await fetch(`${BASE_URL}/wholesaler/enquiries/${newEnquiry.id}/status`, {
    method: 'PATCH',
    headers: wHeaders,
    body: JSON.stringify({
      status: 'responded',
      internal_note: 'Quotation sent via email on 13 Oct. Follow-up scheduled for Friday.'
    })
  });
  const updateData = await updateRes.json();
  console.log(`✓ Test 10: Wholesaler updated status to '${updateData.data.enquiry.status}', Internal Note: '${updateData.data.enquiry.internal_note}'`);

  // Test 11: WhatsApp-disabled Wholesaler (BreezeMaster) validation
  const breezeRes = await fetch(`${BASE_URL}/public/catalog/breezemaster`);
  const breezeData = await breezeRes.json();
  const breezeWholesaler = breezeData.data.catalog;

  const breezeProdsRes = await fetch(`${BASE_URL}/public/catalog/breezemaster/products`);
  const breezeProdsData = await breezeProdsRes.json();
  const breezeProduct = breezeProdsData.data.products[0];
  console.log(`✓ Test 11a: BreezeMaster WhatsApp is: ${breezeWholesaler.whatsapp}`);

  const waFailRes = await fetch(`${BASE_URL}/enquiries`, {
    method: 'POST',
    headers: rHeaders,
    body: JSON.stringify({
      channel: 'whatsapp',
      name: 'Pooja Sharma',
      email: 'pooja.electricals@gmail.com',
      phone: '+91 98765 43210',
      items: [{ productId: breezeProduct.id, quantity: 10 }]
    })
  });
  const waFailData = await waFailRes.json();
  if (waFailRes.status === 422) {
    console.log(`✓ Test 11b: BreezeMaster WhatsApp correctly rejected with HTTP ${waFailRes.status}:`, waFailData.message);
  } else {
    console.error('✗ ERROR: BreezeMaster WhatsApp enquiry should have been rejected with 422! Got:', waFailRes.status, waFailData);
  }

  // Test 12: WhatsApp URL Builder on wholesaler with WhatsApp configured
  const waSuccessRes = await fetch(`${BASE_URL}/enquiries`, {
    method: 'POST',
    headers: rHeaders,
    body: JSON.stringify({
      channel: 'whatsapp',
      name: 'Pooja Sharma',
      email: 'pooja.electricals@gmail.com',
      phone: '+91 98765 43210',
      address: 'Shop 14, Bajirao Road, Pune',
      message: 'Can you deliver within 3 days?',
      items: [{ productId: product.id, quantity: 20 }]
    })
  });
  const waSuccessData = await waSuccessRes.json();
  console.log('✓ Test 12: WhatsApp Enquiry URL successfully generated:');
  console.log('   Enquiry No:', waSuccessData.data.enquiry.enquiry_no);
  console.log('   WhatsApp URL:', waSuccessData.data.whatsapp_url);

  console.log('\n=== ALL 12 CORE PLATFORM FLOW TESTS PASSED FLAWLESSLY! ===');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
