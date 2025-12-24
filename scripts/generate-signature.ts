// scripts/generate-signature.ts
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

function generateSignature() {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error('❌ PAYSTACK_SECRET_KEY not found in environment variables');
    return;
  }

  // Sample payload - EXACTLY what you'll send in Postman
  const payload = {
    event: 'charge.success',
    data: {
      id: 123456789,
      reference: `TEST_REF_${Date.now()}`,
      amount: 5000000, // 50,000 Naira in kobo
      status: 'success',
      metadata: {
        bookingReference: 'BOOK-A1B2C3',
        custom_fields: [
          {
            display_name: 'Booking Reference',
            variable_name: 'booking_reference',
            value: 'BOOK-A1B2C3',
          },
        ],
      },
    },
  };

  const rawBody = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  console.log('🎯 Copy this to Postman:');
  console.log('\n📝 RAW BODY:');
  console.log(rawBody);
  console.log('\n🔐 SIGNATURE:');
  console.log(signature);
  console.log('\n📋 Header to add in Postman:');
  console.log('x-paystack-signature:', signature);
}

generateSignature();
