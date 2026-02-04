/**
 * ═══════════════════════════════════════════════════════════════
 * NOVO SHUTTLE - PAYMENT SERVICE (PRODUCTION READY)
 * ═══════════════════════════════════════════════════════════════
 *
 * This service handles all payment operations for shuttle bookings:
 * 1. Initialize payment with Paystack
 * 2. Verify payment status
 * 3. Process Paystack webhook notifications
 *
 * IMPORTANT: This service handles real money transactions!
 * Always test in Paystack TEST mode before going LIVE.
 *
 * @author Novo Development Team
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════
 */

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
  // Logger for tracking payment operations
  // E dey help us know wetin dey happen for production
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBooking>,
    private readonly paystackService: PaystackService,
  ) {}

  /**
   * ═══════════════════════════════════════════════════════════════
   * 1️⃣ INITIALIZE PAYMENT
   * ═══════════════════════════════════════════════════════════════
   *
   * This method starts the payment process:
   * - Validates the booking exists and is unpaid
   * - Creates a unique payment reference
   * - Calls Paystack API to get payment URL
   * - Saves the reference to the booking
   *
   * Flow: User clicks "Pay Now" → Frontend calls this endpoint →
   *       Backend returns Paystack payment URL → User pays on Paystack
   *
   * @param bookingId - The MongoDB ObjectId of the booking
   * @returns Payment initialization response with authorization URL
   */
  async initializePayment(bookingId: string) {
    // ✅ Step 1: Validate booking ID format
    // Make sure say na valid MongoDB ObjectId
    if (!isValidObjectId(bookingId)) {
      throw new BadRequestException('Invalid booking ID format');
    }

    // ✅ Step 2: Fetch booking from database
    const booking = await this.bookingModel.findById(bookingId);

    // Check if booking exists
    if (!booking) {
      throw new BadRequestException('Booking not found in database');
    }

    // Check if booking has email (required for payment)
    if (!booking.email) {
      throw new BadRequestException('Booking email is missing');
    }

    // Check if booking is already paid (prevent double payment)
    if (booking.status === BookingStatus.PAID) {
      throw new BadRequestException('This booking has already been paid');
    }

    // ✅ Step 3: Generate unique payment reference
    // Format: NOVO-{last8chars}-{timestamp}
    // Example: NOVO-a149bfc0-1769700538688
    const reference = `NOVO-${bookingId.substring(
      bookingId.length - 8,
    )}-${Date.now()}`;

    // ✅ Step 4: Call Paystack API to initialize transaction
    // Paystack go return authorization URL wey user go use pay
    const paystackResponse = await this.paystackService.initializeTransaction({
      email: booking.email,
      amount: Number(booking.price) * 100, // Convert to kobo (NGN × 100)
      reference,
      metadata: {
        bookingId: booking._id.toString(),
        customData: 'Novo Shuttle Booking',
        passengers: booking.passengers,
        travelDate: booking.travelDate,
      },
    });

    // ✅ Step 5: Save payment reference to booking
    // This allows us to track the payment later
    booking.paymentReference = reference;
    await booking.save();

    // Log for monitoring
    this.logger.log(
      `[Payment Init] ✅ Booking ${bookingId} initialized - Ref: ${reference}`,
    );

    // ✅ Step 6: Return response to frontend
    return {
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
      message: 'Payment initialized successfully',
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * 2️⃣ VERIFY PAYMENT (Manual Verification)
   * ═══════════════════════════════════════════════════════════════
   *
   * This method manually verifies a payment:
   * - Called by frontend after user returns from Paystack
   * - Calls Paystack API to check payment status
   * - Updates booking status if payment was successful
   *
   * Flow: User pays on Paystack → Paystack redirects back →
   *       Frontend calls this endpoint → Backend verifies and updates
   *
   * NOTE: This is a FALLBACK. Webhook is the primary method!
   *
   * @param reference - The payment reference to verify
   * @returns Payment verification result
   */
  async verifyPayment(reference: string) {
    try {
      // ✅ Step 1: Call Paystack API to verify transaction
      const paystackResponse =
        await this.paystackService.verifyTransaction(reference);

      // Check if payment was successful
      if (!paystackResponse || paystackResponse.data.status !== 'success') {
        throw new BadRequestException(
          'Payment verification failed or payment was not successful',
        );
      }

      // ✅ Step 2: Extract booking ID from metadata
      const bookingId = (paystackResponse.data.metadata as any)?.bookingId;

      if (!bookingId) {
        throw new BadRequestException(
          'Invalid payment metadata - booking ID not found',
        );
      }

      // ✅ Step 3: Fetch booking from database
      const booking = await this.bookingModel.findById(bookingId);

      if (!booking) {
        throw new BadRequestException('Booking not found in database');
      }

      // ✅ Step 4: Check if already marked as paid (Idempotency)
      // This prevents marking the same booking as paid multiple times
      if (booking.status === BookingStatus.PAID) {
        this.logger.log(
          `[Payment Verify] ℹ️ Booking ${bookingId} already marked as paid`,
        );
        return {
          success: true,
          message: 'Payment already verified',
          bookingId: booking._id,
          status: booking.status,
          paidAt: booking.paidAt,
        };
      }

      // ✅ Step 5: Update booking status to PAID
      booking.status = BookingStatus.PAID;
      booking.paidAt = new Date();
      await booking.save();

      this.logger.log(
        `[Payment Verify] ✅ Booking ${bookingId} marked as PAID via manual verification`,
      );

      // ✅ Step 6: Return success response
      return {
        success: true,
        message: 'Payment verified successfully',
        bookingId: booking._id,
        status: booking.status,
        paidAt: booking.paidAt,
      };
    } catch (error) {
      this.logger.error(
        `[Payment Verify] ❌ Error verifying payment:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * 3️⃣ HANDLE PAYSTACK WEBHOOK (Primary Payment Notification)
   * ═══════════════════════════════════════════════════════════════
   *
   * This is the MAIN method for processing payments!
   * Paystack automatically calls this endpoint when payment succeeds.
   *
   * Security Features:
   * - HMAC SHA512 signature verification (prevents fake webhooks)
   * - Idempotency check (prevents double processing)
   * - Amount verification (ensures correct amount was paid)
   *
   * Flow: User pays → Paystack sends webhook → This method processes →
   *       Booking status updated automatically
   *
   * CRITICAL: Always return 200 OK to Paystack, even on errors!
   * If you return error, Paystack will retry the webhook multiple times.
   *
   * @param signature - HMAC signature from Paystack (for security)
   * @param rawBody - Raw request body as Buffer (needed for signature verification)
   */
  async handlePaystackWebhook(signature: string, rawBody: Buffer) {
    // ═══════════════════════════════════════════════════════════════
    // LOGGING - Start of webhook processing
    // ═══════════════════════════════════════════════════════════════
    this.logger.log('═══════════════════════════════════════');
    this.logger.log('🔔 PAYSTACK WEBHOOK RECEIVED');
    this.logger.log('═══════════════════════════════════════');

    const secret = process.env.PAYSTACK_SECRET_KEY;
    const isDev = process.env.NODE_ENV === 'development';

    // Log environment info for debugging
    this.logger.log(`📊 Environment: ${process.env.NODE_ENV || 'not set'}`);
    this.logger.log(`📦 Raw body received: ${!!rawBody}`);
    this.logger.log(`📦 Raw body size: ${rawBody?.length || 0} bytes`);
    this.logger.log(`🔑 Signature present: ${!!signature}`);
    this.logger.log(`🔐 Secret key configured: ${!!secret}`);

    // ═══════════════════════════════════════════════════════════════
    // SECURITY - Signature Verification
    // ═══════════════════════════════════════════════════════════════
    // Paystack signs every webhook with your secret key.
    // We must verify this signature to ensure the webhook is genuine.
    // Without this, anyone could send fake payment notifications!

    if (isDev) {
      // ⚠️ DEVELOPMENT MODE: Skip signature verification for testing
      // Make sure to NEVER deploy with NODE_ENV=development!
      this.logger.warn('⚠️  DEV MODE: SKIPPING SIGNATURE VERIFICATION');
      this.logger.warn('⚠️  This should NEVER happen in production!');
      this.logger.warn('⚠️  Set NODE_ENV=production before deploying!');
    } else {
      // ✅ PRODUCTION MODE: Full signature verification

      // Step 1: Validate we have all required data
      if (!secret) {
        this.logger.error(
          '[Webhook] ❌ CRITICAL: PAYSTACK_SECRET_KEY not configured in .env',
        );
        return; // Cannot verify without secret key
      }

      if (!signature) {
        this.logger.warn(
          '[Webhook] ⚠️ Missing x-paystack-signature header from request',
        );
        return; // Cannot verify without signature
      }

      if (!rawBody || rawBody.length === 0) {
        this.logger.warn('[Webhook] ⚠️ Empty request body received');
        return; // Nothing to process
      }

      // Step 2: Compute expected signature
      // We create HMAC SHA512 hash of the raw body using our secret key
      const computedHash = crypto
        .createHmac('sha512', secret)
        .update(rawBody)
        .digest('hex');

      // Step 3: Compare signatures
      // If they don't match, the webhook is not from Paystack!
      if (computedHash !== signature) {
        this.logger.error('[Webhook] ❌ SECURITY ALERT: SIGNATURE MISMATCH!');
        this.logger.error(`Expected: ${computedHash.substring(0, 20)}...`);
        this.logger.error(`Received: ${signature.substring(0, 20)}...`);
        this.logger.error('This webhook may be fake! Ignoring...');
        return; // Do not process fake webhooks!
      }

      this.logger.log('[Webhook] ✅ Signature verified - webhook is authentic');
    }

    // ═══════════════════════════════════════════════════════════════
    // PARSING - Convert raw body to JavaScript object
    // ═══════════════════════════════════════════════════════════════
    let event: any;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
      this.logger.log('[Webhook] ✅ Webhook payload parsed successfully');
    } catch (error) {
      this.logger.error(
        '[Webhook] ❌ Failed to parse webhook JSON:',
        error.message,
      );
      return; // Cannot process invalid JSON
    }

    this.logger.log(`[Webhook] 📨 Event type: ${event.event}`);

    // ═══════════════════════════════════════════════════════════════
    // EVENT TYPE VALIDATION
    // ═══════════════════════════════════════════════════════════════
    // Paystack sends many event types (charge.success, transfer.success, etc.)
    // We only process payment success events
    const supportedEvents = ['charge.success', 'paymentrequest.success'];

    if (!supportedEvents.includes(event.event)) {
      this.logger.log(
        `[Webhook] ℹ️ Ignoring unsupported event type: ${event.event}`,
      );
      return; // Not a payment success event, skip it
    }

    // ═══════════════════════════════════════════════════════════════
    // EXTRACT BOOKING ID
    // ═══════════════════════════════════════════════════════════════
    // The booking ID is stored in the metadata we sent during initialization
    const bookingId = event?.data?.metadata?.bookingId;

    if (!bookingId) {
      this.logger.error('[Webhook] ❌ Missing bookingId in webhook metadata');
      this.logger.error(
        `[Webhook] Received metadata: ${JSON.stringify(event?.data?.metadata)}`,
      );
      return; // Cannot process without booking ID
    }

    this.logger.log(
      `[Webhook] 🔍 Processing payment for booking: ${bookingId}`,
    );

    // ═══════════════════════════════════════════════════════════════
    // FETCH BOOKING FROM DATABASE
    // ═══════════════════════════════════════════════════════════════
    const booking = await this.bookingModel.findById(bookingId);

    if (!booking) {
      this.logger.error(
        `[Webhook] ❌ Booking not found in database: ${bookingId}`,
      );
      return; // Cannot update non-existent booking
    }

    this.logger.log(
      `[Webhook] ✅ Booking found - Current status: ${booking.status}`,
    );

    // ═══════════════════════════════════════════════════════════════
    // IDEMPOTENCY CHECK (Very Important!)
    // ═══════════════════════════════════════════════════════════════
    // Paystack may send the same webhook multiple times (network issues, retries)
    // We must ensure we only process each payment ONCE!
    // If booking is already PAID, we skip processing
    if (booking.status === BookingStatus.PAID) {
      this.logger.log(
        `[Webhook] ℹ️ Booking ${bookingId} already marked as PAID - skipping duplicate processing`,
      );
      return; // Already processed, nothing to do
    }

    // ═══════════════════════════════════════════════════════════════
    // AMOUNT VERIFICATION (Security Check)
    // ═══════════════════════════════════════════════════════════════
    // Verify that the amount paid matches the booking price
    // This prevents issues where wrong amount was paid
    const expectedAmount = Number(booking.price) * 100; // Convert to kobo
    const paidAmount = event?.data?.amount; // Already in kobo from Paystack

    this.logger.log(
      `[Webhook] 💰 Amount verification - Expected: ₦${expectedAmount / 100} (${expectedAmount} kobo), Received: ₦${paidAmount / 100} (${paidAmount} kobo)`,
    );

    if (paidAmount !== expectedAmount) {
      this.logger.error('[Webhook] ❌ AMOUNT MISMATCH!');
      this.logger.error(
        `Expected ${expectedAmount} kobo but received ${paidAmount} kobo`,
      );
      this.logger.error('This payment may need manual review!');
      // TODO: In production, you might want to:
      // 1. Mark booking as "DISPUTED" or "AMOUNT_MISMATCH"
      // 2. Send alert to admin
      // 3. Store the payment data for manual reconciliation
      return; // Do not mark as paid if amount is wrong
    }

    // ═══════════════════════════════════════════════════════════════
    // UPDATE BOOKING STATUS - Mark as PAID
    // ═══════════════════════════════════════════════════════════════
    // At this point:
    // ✅ Signature is valid (webhook is from Paystack)
    // ✅ Event type is payment success
    // ✅ Booking exists in database
    // ✅ Booking is not already paid (idempotency check passed)
    // ✅ Amount matches what was expected
    //
    // So we can safely mark the booking as PAID!

    booking.status = BookingStatus.PAID;
    booking.paidAt = new Date(event.data.paid_at ?? Date.now());
    await booking.save();

    // ═══════════════════════════════════════════════════════════════
    // SUCCESS LOGGING
    // ═══════════════════════════════════════════════════════════════
    this.logger.log(
      `[Webhook] 🎉 SUCCESS! Booking ${bookingId} marked as PAID`,
    );
    this.logger.log(`[Webhook] 💳 Payment Reference: ${event.data.reference}`);
    this.logger.log(
      `[Webhook] 💰 Amount Paid: ₦${paidAmount / 100} (${paidAmount} kobo)`,
    );
    this.logger.log(`[Webhook] ⏰ Paid At: ${booking.paidAt}`);
    this.logger.log(
      `[Webhook] 👤 Customer: ${booking.fullName} (${booking.email})`,
    );
    this.logger.log('═══════════════════════════════════════\n');

    // ═══════════════════════════════════════════════════════════════
    // OPTIONAL: POST-PAYMENT ACTIONS
    // ═══════════════════════════════════════════════════════════════
    // After successfully marking as paid, you can:
    // 
    // 1. Send confirmation email to customer
    //    await this.emailService.sendBookingConfirmation(booking);
    // 
    // 2. Send SMS notification
    //    await this.smsService.sendPaymentConfirmation(booking);
    // 
    // 3. Update analytics/metrics
    //    await this.analyticsService.trackSuccessfulPayment(booking);
    // 
    // 4. Trigger other business logic
    //    await this.notificationService.notifyAdmin(booking);
    // 
    // NOTE: These should be async/background jobs to avoid blocking
    //       the webhook response. Use queues (Bull, BeeQueue) for this!
  }
}