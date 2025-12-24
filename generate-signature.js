// generate-signature.js
const crypto = require('crypto');
require('dotenv').config();

function generateTestSignature() {
  // Use your test secret key from .env
  const secret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxxxxxxxxxxxxxxxx';
  
  if (!secret) {
    console.error('❌ PAYSTACK_SECRET_KEY not found in .env file');
    return;
  }

  console.log('🔐 Using secret key:', secret.substring(0, 10) + '...');

  // Create test payload - SIMPLE VERSION
  const payload = {
    event: 'charge.success',
    data: {
      id: 123456789,
      reference: 'TEST_' + Date.now(),
      amount: 500000, // 5,000 Naira in kobo (500,000 kobo)
      status: 'success',
      metadata: {
        bookingReference: 'BOOK-ABC123' // Make sure this matches your test booking
      }
    }
  };

  // Convert to JSON string - EXACTLY what will be sent
  const rawBody = JSON.stringify(payload);
  
  // Generate signature
  const signature = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  console.log('\n🎯 COPY THIS TO POSTMAN:');
  console.log('='.repeat(50));
  console.log('\n📝 RAW BODY (copy exactly):');
  console.log(rawBody);
  console.log('\n🔐 SIGNATURE (add as header):');
  console.log('x-paystack-signature:', signature);
  console.log('\n📍 WEBHOOK URL:');
  console.log('POST http://localhost:3000/payments/webhook');
  console.log('='.repeat(50));
  
  console.log('\n💡 TIPS:');
  console.log('1. Make sure raw body in Postman matches EXACTLY (no extra spaces)');
  console.log('2. Booking reference should exist in your database');
  console.log('3. Amount is in kobo (divide by 100 for Naira)');
}

generateTestSignature();