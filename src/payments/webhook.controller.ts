// src/payments/webhook.controller.ts
import {
  Controller,
  Post,
  Headers,
  BadRequestException,
  Req,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express'; // 🔥 Add this
import * as crypto from 'crypto';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentMethod, PaymentStatus } from '../bookings/types/payment.type';

// 🔥 Create interface locally instead of importing
interface RequestWithRawBody extends Request {
  rawBody?: string;
}

interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: 'success' | 'failed' | 'abandoned';
    metadata?: {
      bookingReference?: string;
      custom_fields?: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
    };
  };
}

@Controller('payments/webhook')
export class PaystackWebhookController {
  private readonly logger = new Logger(PaystackWebhookController.name);

  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RequestWithRawBody, // 🔥 Now using local interface
  ) {
    // 🔥 STEP 1: Log incoming request for debugging
    this.logger.debug('Webhook received');
    this.logger.debug(`Signature: ${signature}`);
    this.logger.debug(`Has rawBody: ${!!req.rawBody}`);

    // 🔥 STEP 2: Check if secret key exists
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      this.logger.error('Paystack secret key not configured');
      throw new BadRequestException('Paystack secret key not configured');
    }

    // 🔥 STEP 3: Check if signature exists
    if (!signature) {
      this.logger.error('Missing Paystack signature header');
      throw new BadRequestException('Missing signature header');
    }

    // 🔥 STEP 4: Get raw body
    const rawBody = req.rawBody;

    if (!rawBody) {
      this.logger.error('Raw body is empty');
      throw new BadRequestException('Raw body is required');
    }

    // 🔥 STEP 5: Verify signature
    const computedHash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    this.logger.debug(`Computed hash: ${computedHash}`);
    this.logger.debug(`Received signature: ${signature}`);

    if (computedHash !== signature) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log('✅ Signature verified successfully');

    // 🔥 STEP 6: Parse the payload
    let payload: PaystackWebhookPayload;

    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      this.logger.error('Failed to parse webhook payload', error);
      throw new BadRequestException('Invalid JSON payload');
    }

    this.logger.debug(`Event type: ${payload.event}`);
    this.logger.debug(`Payment status: ${payload.data.status}`);

    // 🔥 STEP 7: Check event type
    if (payload.event !== 'charge.success') {
      this.logger.debug(`Received non-charge event: ${payload.event}`);
      return { received: true, message: 'Event not processed' };
    }

    // 🔥 STEP 8: Check payment status
    if (payload.data.status !== 'success') {
      this.logger.debug(`Payment failed: ${payload.data.status}`);
      return { received: true, message: 'Payment not successful' };
    }

    this.logger.log('✅ Payment successful, processing...');

    // 🔥 STEP 9: Extract booking reference
    let bookingReference = payload.data.metadata?.bookingReference;

    // Alternative: Check custom fields
    if (!bookingReference && payload.data.metadata?.custom_fields) {
      const bookingField = payload.data.metadata.custom_fields.find(
        field => field.variable_name === 'booking_reference'
      );
      bookingReference = bookingField?.value;
    }

    if (!bookingReference) {
      this.logger.error('bookingReference missing in Paystack metadata');
      this.logger.debug('Metadata:', payload.data.metadata);
      throw new BadRequestException('bookingReference missing in Paystack metadata');
    }

    this.logger.log(`Found booking reference: ${bookingReference}`);

    // 🔥 STEP 10: Update payment in database
    try {
      await this.bookingsService.updatePayment(bookingReference, {
        method: PaymentMethod.PAYSTACK,
        amount: payload.data.amount / 100, // Convert from kobo to naira
        status: PaymentStatus.SUCCESS,
        verified: true,
        reference: payload.data.reference,
        paystackReference: payload.data.reference,
        verifiedAt: new Date(),
      });

      this.logger.log(`✅ Booking ${bookingReference} payment updated successfully`);

      return {
        received: true,
        message: 'Payment processed successfully',
        bookingReference,
        amount: payload.data.amount / 100,
      };
    } catch (error) {
      this.logger.error('Error updating booking payment', error);
      throw new BadRequestException('Failed to update booking payment');
    }
  }
}
