// webhook-signature-generator.js
// Run this to generate proper signature for Postman testing

const crypto = require('crypto');

// ⚠️ IMPORTANT: Replace with your actual PAYSTACK_SECRET_KEY from .env
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_8f40ad876e8ac1b9b3a16e0ac606c6b30fba0d1b'; // ← CHANGE THIS!

// Sample webhook payload - modify as needed
const webhookPayload = {
  event: 'charge.success',
  data: {
    id: 123456789,
    status: 'success',
    reference: 'NOVO-a149bfc0-1769700538688', // ← Use actual booking reference
    amount: 5000000, // In kobo (50,000 NGN)
    currency: 'NGN',
    paid_at: '2026-01-29T15:35:00.000Z',
    customer: {
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe'
    },
    metadata: {
      bookingId: '697b78dea941c84ca149bfc0', // ← Use actual booking ID
      customData: 'Novo Shuttle Booking'
    }
  }
};

// Convert to string (exactly as it will be sent)
const payloadString = JSON.stringify(webhookPayload);

// Compute HMAC SHA512 signature
const signature = crypto
  .createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(payloadString)
  .digest('hex');

console.log('═══════════════════════════════════════════════');
console.log('🔐 PAYSTACK WEBHOOK SIGNATURE GENERATOR');
console.log('═══════════════════════════════════════════════\n');

console.log('📝 Webhook Payload:');
console.log(JSON.stringify(webhookPayload, null, 2));
console.log('\n');

console.log('🔑 Generated Signature:');
console.log(signature);
console.log('\n');

console.log('📋 Copy this for Postman:');
console.log('═══════════════════════════════════════════════');
console.log('Header: x-paystack-signature');
console.log('Value:', signature);
console.log('═══════════════════════════════════════════════\n');

console.log('📦 Postman Setup Instructions:');
console.log('1. Open Postman');
console.log('2. Create POST request to: http://localhost:4000/payments/webhook');
console.log('3. In Headers tab, add:');
console.log('   Key: x-paystack-signature');
console.log('   Value:', signature.substring(0, 30) + '...');
console.log('4. In Body tab (raw JSON), paste:');
console.log(JSON.stringify(webhookPayload, null, 2));
console.log('\n✅ Ready to test!\n');

// Additional helper: Generate for different events
console.log('🎯 Other Event Types You Can Test:\n');

const otherEvents = [
  {
    name: 'Payment Success (paymentrequest.success)',
    event: 'paymentrequest.success'
  },
  {
    name: 'Charge Success',
    event: 'charge.success'
  },
  {
    name: 'Transfer Success',
    event: 'transfer.success'
  }
];

otherEvents.forEach(evt => {
  const payload = { ...webhookPayload, event: evt.event };
  const sig = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  console.log(`${evt.name}:`);
  console.log(`  Event: ${evt.event}`);
  console.log(`  Signature: ${sig.substring(0, 40)}...`);
  console.log('');
});

// Helper function to test signature verification
function testSignatureVerification() {
  console.log('\n🧪 Testing Signature Verification:\n');
  
  const testPayload = JSON.stringify(webhookPayload);
  const testSig = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(testPayload)
    .digest('hex');
  
  const isValid = testSig === signature;
  
  if (isValid) {
    console.log('✅ Signature verification: PASSED');
  } else {
    console.log('❌ Signature verification: FAILED');
  }
  
  return isValid;
}

testSignatureVerification();

console.log('\n═══════════════════════════════════════════════');
console.log('⚠️  IMPORTANT NOTES:');
console.log('═══════════════════════════════════════════════');
console.log('1. Make sure PAYSTACK_SECRET_KEY matches your .env');
console.log('2. Use ACTUAL booking ID from your database');
console.log('3. Amount must be in KOBO (multiply NGN by 100)');
console.log('4. Reference must match booking.paymentReference');
console.log('5. Test in Paystack TEST mode before LIVE mode');
console.log('═══════════════════════════════════════════════\n');
