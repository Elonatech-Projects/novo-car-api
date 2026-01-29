// src/payments/payments.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaystackService } from './paystack.service';
import {
  BookingStatus,
  UserBooking,
} from '../booking/schema/user-booking.schema';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBooking>,
    private readonly paystackService: PaystackService,
  ) {}

  async initializePayment(bookingId: string) {
    if (!isValidObjectId(bookingId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const booking = await this.bookingModel.findById(bookingId);

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (!booking.email) {
      throw new BadRequestException('Booking email is missing');
    }

    if (booking.status === BookingStatus.PAID) {
      throw new BadRequestException('Booking already paid');
    }

    const reference = `NOVO-${bookingId.substring(bookingId.length - 8)}-${Date.now()}`;

    const paystackResponse = await this.paystackService.initializeTransaction({
      email: booking.email,
      amount: Number(booking.price) * 100,
      reference,
      metadata: {
        bookingId: booking._id.toString(),
        customData: 'Novo Shuttle Booking',
      },
    });

    booking.paymentReference = reference;
    await booking.save();

    this.logger.log(`[Payment Init] Booking ${bookingId} - Ref: ${reference}`);

    return {
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
    };
  }

  async verifyPayment(reference: string) {
    try {
      const paystackResponse =
        await this.paystackService.verifyTransaction(reference);

      if (!paystackResponse || paystackResponse.data.status !== 'success') {
        throw new BadRequestException('Payment not successful');
      }

      const bookingId = (paystackResponse.data.metadata as any)?.bookingId;

      if (!bookingId) {
        throw new BadRequestException('Invalid payment metadata');
      }

      const booking = await this.bookingModel.findById(bookingId);

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      if (booking.status === BookingStatus.PAID) {
        this.logger.log(`[Payment Verify] Booking ${bookingId} already paid`);
        return {
          success: true,
          message: 'Booking payment verified successfully',
          bookingId: booking._id,
          status: booking.status,
        };
      }

      booking.status = BookingStatus.PAID;
      booking.paidAt = new Date();
      await booking.save();

      this.logger.log(`[Payment Verify] Booking ${bookingId} marked as PAID`);

      return {
        success: true,
        bookingId: booking._id,
        status: booking.status,
        paidAt: booking.paidAt,
      };
    } catch (error) {
      this.logger.error(`[Payment Verify] Error:`, error.message);
      throw error;
    }
  }

  // 🔥 WEBHOOK WITH DEV MODE
  async handlePaystackWebhook(signature: string, rawBody: Buffer) {
    this.logger.log('═══════════════════════════════════════');
    this.logger.log('🔥 WEBHOOK CALLED');
    this.logger.log('═══════════════════════════════════════');

    const secret = process.env.PAYSTACK_SECRET_KEY;
    const isDev = process.env.NODE_ENV === 'development';

    // Log what we received
    this.logger.log(`📊 Environment: ${process.env.NODE_ENV || 'not set'}`);
    this.logger.log(`📦 Raw body received: ${!!rawBody}`);
    this.logger.log(`📦 Raw body length: ${rawBody?.length || 0} bytes`);
    this.logger.log(`🔑 Signature received: ${!!signature}`);
    this.logger.log(`🔐 Secret key configured: ${!!secret}`);

    // DEV MODE: Skip signature
    if (isDev) {
      this.logger.warn('⚠️  DEV MODE: SKIPPING SIGNATURE VERIFICATION');
      this.logger.warn('⚠️  This should NEVER run in production!');
    } else {
      // PRODUCTION: Verify signature
      if (!secret || !signature || !rawBody) {
        this.logger.error('[Webhook] Missing required fields for verification');
        return;
      }

      const computedHash = crypto
        .createHmac('sha512', secret)
        .update(rawBody)
        .digest('hex');

      if (computedHash !== signature) {
        this.logger.error('[Webhook] ❌ SIGNATURE MISMATCH');
        return;
      }

      this.logger.log('[Webhook] ✅ Signature verified');
    }

    // Parse event
    let event: any;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
      this.logger.log('[Webhook] ✅ Event parsed successfully');
    } catch (error) {
      this.logger.error('[Webhook] ❌ Failed to parse JSON:', error.message);
      return;
    }

    this.logger.log(`[Webhook] 📨 Event type: ${event.event}`);

    // Check event type
    const supportedEvents = ['charge.success', 'paymentrequest.success'];
    if (!supportedEvents.includes(event.event)) {
      this.logger.log(`[Webhook] ⏭️  Ignoring event: ${event.event}`);
      return;
    }

    // Extract booking ID
    const bookingId = event?.data?.metadata?.bookingId;
    if (!bookingId) {
      this.logger.error('[Webhook] ❌ Missing bookingId in metadata');
      this.logger.error(`[Webhook] Metadata: ${JSON.stringify(event?.data?.metadata)}`);
      return;
    }

    this.logger.log(`[Webhook] 🔍 Processing booking: ${bookingId}`);

    // Find booking
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      this.logger.error(`[Webhook] ❌ Booking not found: ${bookingId}`);
      return;
    }

    this.logger.log(`[Webhook] ✅ Booking found - Status: ${booking.status}`);

    // Check if already paid
    if (booking.status === BookingStatus.PAID) {
      this.logger.log(`[Webhook] ⏭️  Booking already PAID - skipping`);
      return;
    }

    // Verify amount
    const expectedAmount = Number(booking.price) * 100;
    const paidAmount = event?.data?.amount;

    this.logger.log(`[Webhook] 💰 Amount check - Expected: ${expectedAmount}, Received: ${paidAmount}`);

    if (paidAmount !== expectedAmount) {
      this.logger.error(`[Webhook] ❌ Amount mismatch!`);
      return;
    }

    // Update booking
    booking.status = BookingStatus.PAID;
    booking.paidAt = new Date(event.data.paid_at ?? Date.now());
    await booking.save();

    this.logger.log(`[Webhook] 🎉 SUCCESS! Booking ${bookingId} marked as PAID`);
    this.logger.log(`[Webhook] ✅ Paid at: ${booking.paidAt}`);
    this.logger.log('═══════════════════════════════════════\n');
  }
}