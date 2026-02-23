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
import { UserBooking } from '../booking/schema/user-booking.schema';
import * as crypto from 'crypto';
import {
  ShuttleBooking,
  ShuttleBookingDocument,
} from '../shuttle-booking/schema/shuttle-booking.schema';
import { PaystackWebhookEvent } from './types/paystack-webhook.type';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { NotificationService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '@nestjs/config';
import {
  Shuttle,
  ShuttleDocument,
} from '../shuttle-services/schema/shuttle-service.schema';
import { ShuttleBookingStatus } from '../common/enums/shuttle-booking.enum';
import { Auth } from '../auth/schema/auth-schema';

type PaystackMetadata = {
  bookingId?: string;
  source?: 'booking' | 'shuttle-booking' | 'shuttle-services';
  sourceId?: string;
};

@Injectable()
export class PaymentsService {
  // Logger for tracking payment operations
  // E dey help us know wetin dey happen for production
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Auth.name) private userModel: Model<Auth>,
    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBooking>,
    private readonly paystackService: PaystackService, // Paystack Service
    // Shuttle-Bookings
    @InjectModel(ShuttleBooking.name)
    private readonly shuttleBookingModel: Model<ShuttleBookingDocument>,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,

    @InjectModel(Shuttle.name)
    private readonly shuttleServicesModel: Model<ShuttleDocument>,

    private readonly configService: ConfigService,
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
    // ✅ Step 4: Resolve payable amount safely
    const amountNaira = Number(booking.price);

    if (!Number.isFinite(amountNaira) || amountNaira <= 0) {
      throw new BadRequestException('Invalid booking price');
    }

    // Convert to kobo for Paystack
    const amountKobo = amountNaira * 100;

    // ✅ Step 5: Call Paystack API to initialize transaction
    // Paystack go return authorization URL wey user go use pay
    const paystackResponse = await this.paystackService.initializeTransaction({
      email: booking.email,
      amount: amountKobo,
      reference,
      metadata: {
        source: 'booking',
        sourceId: booking._id.toString(),
        // customData: 'Novo Shuttle Booking',
        passengers: booking.passengers,
        travelDate: booking.travelDate,
      },
    });

    // ✅ Step 5: Save payment reference to booking
    // This allows us to track the payment later
    booking.paymentReference = reference;
    await booking.save();

    // Log for monitoring
    // this.logger.log(
    //   `[Payment Init] ✅ Booking ${bookingId} initialized - Ref: ${reference}`,
    // );

    this.logger.log({
      message: 'Booking initalized',
      status: booking.status,
      bookingId: booking._id.toString(),
      reference: reference,
    });

    // ✅ Step 6: Return response to frontend
    return {
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
      message: 'Payment initialized successfully',
    };
  }

  async initializeShuttleServicesPayment(bookingId: string) {
    if (!isValidObjectId(bookingId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const booking = await this.shuttleServicesModel.findById(bookingId);

    if (!booking) {
      throw new BadRequestException('Shuttle service booking not found');
    }

    if (booking.paymentReference) {
      throw new BadRequestException(
        'Payment already initialized for this booking',
      );
    }

    if (booking.status === ShuttleBookingStatus.PAID) {
      throw new BadRequestException('Booking already paid');
    }

    if (booking.status !== ShuttleBookingStatus.RESERVED) {
      throw new BadRequestException('Booking not eligible for payment');
    }

    if (booking.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Booking expired');
    }

    // 🔥 Fetch user safely
    const user = await this.userModel
      .findById(booking.userId)
      .select('email')
      .lean();

    if (!user?.email) {
      throw new BadRequestException('User email not found');
    }

    const reference = `NOVO-SERVICE-${bookingId.slice(-6)}-${Date.now()}`;
    const amountKobo = booking.totalAmount * 100;

    const response = await this.paystackService.initializeTransaction({
      email: user.email,
      amount: amountKobo,
      reference,
      metadata: {
        source: 'shuttle-services',
        sourceId: booking._id.toString(),
      },
    });

    booking.paymentReference = reference;
    await booking.save();

    this.logger.log({
      event: 'SERVICE_PAYMENT_INITIALIZED',
      bookingId,
      reference,
    });

    return {
      success: true,
      authorizationUrl: response.data.authorization_url,
      reference,
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
      const metadata = paystackResponse.data.metadata as PaystackMetadata;

      if (metadata?.source !== 'booking' || !metadata.sourceId) {
        throw new BadRequestException('Invalid payment metadata');
      }

      const bookingId = metadata.sourceId;

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
        // this.logger.log(
        //   `[Payment Verify] ℹ️ Booking ${bookingId} already marked as paid`,
        // );

        this.logger.log({
          event: 'PAYMENT_VERIFY',
          bookingId: bookingId,
          message: 'Booking already marked as paid',
        });
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

      // this.logger.log(
      //   `[Payment Verify] ✅ Booking ${bookingId} marked as PAID via manual verification`,
      // );

      this.logger.log({
        event: 'PAYMENT_VERIFY',
        message:
          'Payment fot this booking has been marked Paid bia manual verification',
        bookingId: bookingId,
      });

      // ✅ Step 6: Return success response
      return {
        success: true,
        message: 'Payment verified successfully',
        bookingId: booking._id,
        status: booking.status,
        paidAt: booking.paidAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      // this.logger.error(
      //   `[Payment Verify] ❌ Error verifying payment: ${message}`,
      // );

      this.logger.error({
        event: 'PAYEMENT_VERIFY',
        message: 'Error occured verifying payement',
        status: message,
      });
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
    let event: PaystackWebhookEvent;
    try {
      event = JSON.parse(rawBody.toString('utf8')) as PaystackWebhookEvent;
    } catch (error: unknown) {
      this.logger.error('[Webhook] Invalid JSON payload', error);
      return;
    }

    this.logger.log(`[Webhook] 📨 Event type: ${event.event}`);

    // ═══════════════════════════════════════════════════════════════
    // EVENT TYPE VALIDATION
    // ═══════════════════════════════════════════════════════════════
    // Paystack sends many event types (charge.success, transfer.success, etc.)
    // We only process payment success events
    const supportedEvents = ['charge.success', 'paymentrequest.success'];

    if (!supportedEvents.includes(event.event)) {
      this.logger.log({
        message: `[Webhook] ℹ️ Ignoring unsupported event type: ${event.event}`,
        event: 'Webhook',
      });
      return; // Not a payment success event, skip it
    }

    // ═══════════════════════════════════════════════════════════════
    // EXTRACT BOOKING ID
    // ═══════════════════════════════════════════════════════════════
    // The booking ID is stored in the metadata we sent during initialization
    const { source, sourceId } = event?.data?.metadata ?? {};

    if (!source || !sourceId) {
      this.logger.warn('[Webhook] Missing payment source metadata');
      return;
    }

    switch (source) {
      case 'booking':
        await this.handleBookingPayment(sourceId, event);
        break;

      case 'shuttle-booking':
        await this.handleShuttleBookingPayment(sourceId, event);
        break;

      case 'shuttle-services':
        await this.handleShuttleServicesPayment(sourceId, event);
        break;

      default:
        this.logger.warn(`[Webhook] Unknown payment source:`, source);
    }

    // ═══════════════════════════════════════════════════════════════
    // SUCCESS LOGGING
    // ═══════════════════════════════════════════════════════════════

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
    //
    // NOTE: These should be async/background jobs to avoid blocking
    //       the webhook response. Use queues (Bull, BeeQueue) for this!
    const refundEvents = ['refund.processed', 'refund.failed'];

    if (refundEvents.includes(event.event)) {
      await this.handleRefundWebhook(event);
      return;
    }
  }

  // ShuttleBooking
  /**
   * Initialize payment for shuttle booking
   * Uses SAME Paystack flow as normal bookings
   */
  async initializeShuttleBookingPayment(shuttleBookingId: string) {
    if (!isValidObjectId(shuttleBookingId)) {
      throw new BadRequestException('Invalid shuttle booking ID');
    }

    const booking = await this.shuttleBookingModel.findById(shuttleBookingId);

    if (!booking) {
      throw new BadRequestException('Shuttle booking not found');
    }

    if (!booking.email) {
      throw new BadRequestException('Booking email is missing');
    }

    if (booking.status === BookingStatus.PAID) {
      throw new BadRequestException('This shuttle booking is already paid');
    }

    const reference = `NOVO-SHUTTLE-${shuttleBookingId.slice(-6)}-${Date.now()}`;

    if (typeof booking.totalPrice !== 'number') {
      throw new BadRequestException('Shuttle booking price not calculated yet');
    }

    const response = await this.paystackService.initializeTransaction({
      email: booking.email,
      amount: booking.totalPrice * 100, // ✅ now guaranteed number
      reference,
      metadata: {
        source: 'shuttle-booking',
        sourceId: booking._id.toString(),
      },
    });

    booking.paymentReference = reference;
    await booking.save();

    return {
      success: true,
      authorizationUrl: response.data.authorization_url,
      reference,
    };
  }

  async requestRefund(
    source: 'booking' | 'shuttle-booking',
    sourceId: string,
    reason?: string,
  ) {
    if (!isValidObjectId(sourceId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    if (source === 'booking') {
      const booking = await this.bookingModel.findById(sourceId);

      if (!booking) throw new BadRequestException('Booking not found');
      if (booking.status !== BookingStatus.PAID) {
        throw new BadRequestException('Only PAID bookings can be refunded');
      }
      if (!booking.paymentReference) {
        throw new BadRequestException('Missing payment reference');
      }

      booking.status = BookingStatus.REFUND_REQUESTED;
      await booking.save();

      await this.paystackService.refundTransaction({
        reference: booking.paymentReference,
      });

      await this.notificationService.refundInitiated({
        source: 'booking',
        emailData: {
          type: 'REFUND_INITIATED',
          to: booking.email,
          subject: 'Refund Initiated – Novo',
          data: {
            reference: booking.paymentReference,
            reason,
          },
        },
      });

      return { success: true };
    }

    // ───────────────────────────────────────

    const shuttleBooking = await this.shuttleBookingModel.findById(sourceId);

    if (!shuttleBooking) {
      throw new BadRequestException('Shuttle booking not found');
    }
    if (shuttleBooking.status !== BookingStatus.PAID) {
      throw new BadRequestException('Only PAID bookings can be refunded');
    }
    if (!shuttleBooking.paymentReference) {
      throw new BadRequestException('Missing payment reference');
    }

    shuttleBooking.status = BookingStatus.REFUND_PENDING;
    await shuttleBooking.save();

    await this.paystackService.refundTransaction({
      reference: shuttleBooking.paymentReference,
    });

    await this.notificationService.refundInitiated({
      source: 'shuttle-booking',
      emailData: {
        type: 'REFUND_INITIATED',
        to: shuttleBooking.email,
        subject: 'Refund Initiated – Novo Shuttle',
        data: {
          reference: shuttleBooking.paymentReference,
          reason,
        },
      },
    });

    return { success: true };
  }

  private async handleShuttleBookingPayment(
    shuttleBookingId: string,
    event: PaystackWebhookEvent,
  ) {
    const booking = await this.shuttleBookingModel.findById(shuttleBookingId);
    if (
      !booking ||
      booking.status === BookingStatus.PAID ||
      booking.status === BookingStatus.REFUND_PENDING ||
      booking.status === BookingStatus.REFUNDED
    ) {
      return;
    }

    const expectedAmount = booking.totalPrice * 100;
    if (event.data.amount !== expectedAmount) return;

    booking.status = BookingStatus.PAID;
    booking.paidAt = new Date(event.data.paid_at ?? Date.now());
    await booking.save();

    await this.notificationService.paymentConfirmed({
      source: 'shuttle-booking',
      emailData: {
        type: 'SHUTTLE_CONFIRMATION',
        to: booking.email,
        subject: 'Payment Confirmed – Novo Shuttle',
        data: {
          reference: booking.bookingReference,
          shuttleType: booking.shuttleType,
          pickup: booking.pickupLocation,
          dropoff: booking.dropoffLocation,
          date: booking.bookingDate,
          time: booking.pickupTime,
          distanceKm: booking.distanceKm,
          amountPaid: booking.totalPrice,
        },
      },
    });
  }

  private async handleBookingPayment(
    bookingId: string,
    event: PaystackWebhookEvent,
  ) {
    const booking = await this.bookingModel.findById(bookingId);
    if (
      !booking ||
      booking.status === BookingStatus.PAID ||
      booking.status === BookingStatus.REFUND_PENDING ||
      booking.status === BookingStatus.REFUNDED
    ) {
      return;
    }

    const expectedAmount = Number(booking.price) * 100;
    if (event.data.amount !== expectedAmount) return;

    booking.status = BookingStatus.PAID;
    booking.paidAt = new Date(event.data.paid_at ?? Date.now());
    await booking.save();

    await this.notificationService.paymentConfirmed({
      source: 'booking',
      emailData: {
        type: 'BOOKING_CONFIRMATION',
        to: booking.email,
        subject: 'Payment Confirmed – Novo',
        data: {
          reference: booking.paymentReference,
          route: 'Trip Booking',
          travelDate: booking.travelDate,
          passengers: booking.passengers,
          amountPaid: booking.price,
        },
      },
    });
  }

  private async handleShuttleServicesPayment(
    bookingId: string,
    event: PaystackWebhookEvent,
  ) {
    const booking = await this.shuttleServicesModel.findById(bookingId);

    if (!booking) return;

    if (
      booking.status === ShuttleBookingStatus.PAID ||
      booking.status === ShuttleBookingStatus.REFUNDED
    ) {
      return;
    }

    const expectedAmount = booking.totalAmount * 100;

    if (event.data.amount !== expectedAmount) {
      this.logger.warn(
        `Amount mismatch for shuttle-services booking ${bookingId}`,
      );
      return;
    }

    booking.status = ShuttleBookingStatus.PAID;
    booking.paidAt = new Date(event.data.paid_at ?? Date.now());
    booking.paymentVerified = true;

    await booking.save();

    this.logger.log({
      event: 'PAYMENT_SUCCESS',
      source: 'shuttle-services',
      bookingId,
    });
  }

  private async handleRefundWebhook(event: PaystackWebhookEvent) {
    const reference = event?.data?.reference;
    if (!reference) return;

    const booking =
      (await this.bookingModel.findOne({ paymentReference: reference })) ??
      (await this.shuttleBookingModel.findOne({ paymentReference: reference }));

    if (!booking) return;

    // 🛑 IDEMPOTENCY GUARD
    if (booking.refundFinalized === true) {
      this.logger.log(
        `[Refund Webhook] 🔁 Duplicate webhook ignored (${booking._id.toString()})`,
      );
      return;
    }

    if (booking.status !== BookingStatus.REFUND_PENDING) return;

    if (event.event === 'refund.processed') {
      booking.status = BookingStatus.REFUNDED;
      booking.refundFinalized = true;
      await booking.save();

      await this.notificationService.refundCompleted({
        source: 'shuttleType' in booking ? 'shuttle-booking' : 'booking',
        emailData: {
          type: 'REFUND_COMPLETED',
          to: booking.email,
          subject: 'Refund Completed – Novo',
          data: {
            reference,
            amount:
              'totalPrice' in booking ? booking.totalPrice : booking.price,
          },
        },
      });

      return;
    }

    if (event.event === 'refund.failed') {
      booking.status = BookingStatus.PAID;
      booking.refundFinalized = true;
      await booking.save();
    }
  }

  private async changeShuttleStatus(
    booking: ShuttleBookingDocument,
    newStatus: BookingStatus,
  ) {
    if (booking.status === newStatus) return;

    booking.status = newStatus;

    booking.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
    });

    await booking.save();
  }

  async verifyRefundStatus(reference: string) {
    this.logger.log({
      reference: reference,
      message: `[Refund Verify] 🔍 Verifying refund for ${reference}`,
    });

    // 1️⃣ Find booking (normal or shuttle)
    const booking =
      (await this.bookingModel.findOne({ paymentReference: reference })) ??
      (await this.shuttleBookingModel.findOne({ paymentReference: reference }));

    if (!booking) {
      throw new BadRequestException('Booking not found for refund reference');
    }

    // Only reconcile pending refunds
    if (booking.status !== BookingStatus.REFUND_PENDING) {
      return {
        success: true,
        message: 'Booking not in REFUND_PENDING state',
        status: booking.status,
      };
    }

    // 2️⃣ Ask Paystack directly
    const refund = await this.paystackService.verifyRefund(reference);

    if (!refund) {
      throw new BadRequestException('Invalid refund response from Paystack');
    }

    const refundStatus = refund.status;

    // 3️⃣ Act based on Paystack truth
    if (refundStatus === 'processed') {
      booking.status = BookingStatus.REFUNDED;
      await booking.save();
      const amountPaid =
        'totalPrice' in booking ? booking.totalPrice : booking.price;
      await this.notificationService.refundCompleted({
        source: 'shuttleType' in booking ? 'shuttle-booking' : 'booking',
        emailData: {
          type: 'REFUND_COMPLETED',
          to: booking.email,
          subject: 'Refund Completed – Novo',
          data: {
            reference,
            amount: amountPaid,
          },
        },
      });

      this.logger.log({
        event: 'REFUND_VERIFY',
        bookingId: booking._id.toString(),
        status: booking.status,
      });

      return {
        success: true,
        status: BookingStatus.REFUNDED,
      };
    }

    if (refundStatus === 'failed') {
      booking.status = BookingStatus.PAID; // rollback
      await booking.save();

      this.logger.error({
        event: 'REFUND_VERIFY',
        bookingId: booking._id.toString(),
        status: booking.status,
      });

      return {
        success: false,
        status: 'failed',
      };
    }

    // still pending
    return {
      success: true,
      status: refundStatus,
    };
  }

  async approveRefund(bookingId: string) {
    if (!isValidObjectId(bookingId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const booking =
      (await this.bookingModel.findById(bookingId)) ??
      (await this.shuttleBookingModel.findById(bookingId));

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.status !== BookingStatus.REFUND_REQUESTED) {
      throw new BadRequestException('Refund not requested');
    }

    if (!booking.paymentReference) {
      throw new BadRequestException('Missing payment reference');
    }

    booking.status = BookingStatus.REFUND_REQUESTED;
    await booking.save();

    await this.paystackService.refundTransaction({
      reference: booking.paymentReference,
    });

    // Audit Logs
    await this.auditService.log('REFUND_APPROVED', {
      bookingId: booking._id,
      performedBy: 'admin',
    });

    return {
      success: true,
      message: 'Refund Approved',
    };
  }
  // Email/SMS
}
