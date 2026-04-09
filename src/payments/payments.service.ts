// src/payments/payments.service.ts
//
// Handles all payment operations:
//   - Initialize payment  (normal bookings + shuttle services)
//   - Verify payment      (manual fallback when webhook is missed)
//   - Webhook handler     (primary confirmation path — Paystack → us)
//   - Refunds             (expired bookings that were paid late)
//   - Audit logging       (every state change leaves a trail)

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, isValidObjectId, Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { PaystackService } from './paystack.service';
import { UserBooking } from '../booking/schema/user-booking.schema';
import { PaystackWebhookEvent } from './types/paystack-webhook.type';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { NotificationService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import {
  Shuttle,
  ShuttleDocument,
} from '../shuttle-services/schema/shuttle-service.schema';
import { ShuttleBookingStatus } from '../common/enums/shuttle-booking.enum';
import { Auth } from '../auth/schema/auth-schema';
import { PaymentSource, PaystackVerifyResponse } from './types/paystack.types';

// ─── Internal types ───────────────────────────────────────────────────────────

type PaystackMetadata = {
  source?: PaymentSource;
  sourceId?: string;
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Auth.name)
    private readonly userModel: Model<Auth>,

    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBooking>,

    @InjectModel(Shuttle.name)
    private readonly shuttleServicesModel: Model<ShuttleDocument>,

    @InjectConnection()
    private readonly connection: Connection,

    private readonly paystackService: PaystackService,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  /* ============================================================
      INITIALIZE — NORMAL BOOKING
  ============================================================ */

  async initializePayment(bookingId: string) {
    if (!isValidObjectId(bookingId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.email) throw new BadRequestException('Booking email missing');
    if (booking.status === BookingStatus.PAID) {
      throw new BadRequestException('Booking already paid');
    }

    const amount = Number(booking.price);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Invalid booking price');
    }

    const reference = `NOVO-${bookingId.slice(-8)}-${Date.now()}`;

    const response = await this.paystackService.initializeTransaction({
      email: booking.email,
      amount: amount * 100, // kobo
      reference,
      metadata: {
        source: 'booking',
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

  /* ============================================================
      INITIALIZE — SHUTTLE SERVICES
  ============================================================ */

  async initializeShuttleServicesPayment(bookingId: string) {
    if (!isValidObjectId(bookingId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const booking = await this.shuttleServicesModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    // ── Status guard ────────────────────────────────────────────────────────

    if (booking.status === ShuttleBookingStatus.PAID) {
      throw new BadRequestException('Booking already paid');
    }

    if (booking.status !== ShuttleBookingStatus.RESERVED) {
      throw new BadRequestException('Booking is not eligible for payment');
    }

    // ── Expiry guard ────────────────────────────────────────────────────────

    if (booking.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Booking has expired. Please rebook.');
    }

    // ── Amount guard ────────────────────────────────────────────────────────

    if (!Number.isFinite(booking.totalAmount) || booking.totalAmount <= 0) {
      throw new BadRequestException('Invalid booking amount');
    }

    // ── Fetch user email (needed for both new + idempotent paths) ───────────
    //
    // We fetch the user BEFORE the idempotent early-return so both paths
    // have access to email. Previously the early-return returned without email,
    // which caused Paystack to reject the popup with undefined email.

    const user = await this.userModel
      .findById(booking.userId)
      .select('email')
      .lean();

    if (!user?.email) {
      throw new BadRequestException('User email not found');
    }

    // ── Idempotent: reuse existing reference if already initialized ─────────
    //
    // If the user clicks "Pay Now" twice or the frontend retries, we return the
    // same Paystack reference instead of creating a duplicate transaction.

    if (booking.paymentReference) {
      this.logger.log(
        `Reusing existing payment reference for booking ${bookingId}`,
      );

      return {
        success: true,
        message: 'Payment already initialized',
        data: {
          reference: booking.paymentReference,
          email: user.email, // ← was missing in the original
          amount: booking.totalAmount * 100,
        },
      };
    }

    // ── Initialize new Paystack transaction ─────────────────────────────────

    // We generate a unique reference for this transaction. The format includes a prefix, the last 6 characters of the booking ID for traceability, and a timestamp to ensure uniqueness. This reference is used to link the Paystack transaction back to our booking when we receive the webhook or do manual verification.
    const reference = `NOVO-SERVICE-${bookingId.slice(-6)}-${Date.now()}`;

    const response = await this.paystackService.initializeTransaction({
      email: user.email,
      amount: booking.totalAmount * 100,
      reference,
      metadata: {
        source: 'shuttle-services',
        sourceId: booking._id.toString(),
      },
    });

    if (!response?.status) {
      throw new BadRequestException('Payment initialization failed');
    }

    booking.paymentReference = reference;
    await booking.save();

    return {
      success: true,
      message: 'Payment initialized successfully',
      data: {
        reference,
        email: user.email,
        amount: booking.totalAmount * 100,
      },
    };
  }

  /* ============================================================
      VERIFY — MANUAL FALLBACK
      Called when user lands on /payment/verify?reference=xxx.
      Acts as a safety net if the webhook was missed or delayed.
  ============================================================ */

  async verifyPayment(reference: string) {
    const paystackResponse =
      await this.paystackService.verifyTransaction(reference);

    if (!paystackResponse || paystackResponse.data.status !== 'success') {
      throw new BadRequestException('Payment not successful');
    }

    const metadata = paystackResponse.data.metadata as PaystackMetadata;

    if (!metadata?.source || !metadata.sourceId) {
      throw new BadRequestException('Invalid payment metadata');
    }

    if (metadata.source === 'shuttle-services') {
      return this.verifyShuttleServicesManually(
        metadata.sourceId,
        paystackResponse,
      );
    }

    if (metadata.source !== 'booking') {
      throw new BadRequestException('Unsupported payment source');
    }

    // ── Normal booking verify ────────────────────────────────────────────────

    const booking = await this.bookingModel.findById(metadata.sourceId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.status === BookingStatus.PAID) {
      // Already confirmed — idempotent success
      return { success: true };
    }

    const expected = Number(booking.price) * 100;
    if (Number(paystackResponse.data.amount) !== expected) {
      throw new BadRequestException('Amount mismatch');
    }

    booking.status = BookingStatus.PAID;
    booking.paidAt = new Date();
    await booking.save();

    return { success: true };
  }

  /* ============================================================
      WEBHOOK — PRIMARY PAYMENT CONFIRMATION
      Paystack → POST /payments/webhook
      This is the authoritative payment confirmation path.
  ============================================================ */

  async handlePaystackWebhook(signature: string, rawBody: Buffer) {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!secret || !signature || !rawBody) return;

    // ── Signature verification (timing-safe) ────────────────────────────────

    const computedHash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    const isValid =
      computedHash.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(signature));

    if (!isValid) {
      this.logger.warn('Webhook rejected: invalid Paystack signature');
      return;
    }

    const event = JSON.parse(rawBody.toString()) as PaystackWebhookEvent;

    // We only act on successful charges
    if (event.event !== 'charge.success') return;

    const metadata = event?.data?.metadata;

    if (
      !metadata ||
      typeof metadata !== 'object' ||
      !metadata.source ||
      !metadata.sourceId
    ) {
      this.logger.warn('Webhook rejected: missing or invalid metadata');
      return;
    }

    // Route to the correct handler based on payment source
    if (metadata.source === 'booking') {
      await this.handleBookingPayment(metadata.sourceId, event);
      return;
    }

    if (metadata.source === 'shuttle-services') {
      await this.handleShuttleServicesPayment(metadata.sourceId, event);
      return;
    }

    this.logger.warn(`Webhook: unrecognized source "${metadata.source}"`);
  }

  /* ============================================================
      WEBHOOK HANDLER — SHUTTLE SERVICES
  ============================================================ */

  private async handleShuttleServicesPayment(
    bookingId: string,
    event: PaystackWebhookEvent,
  ) {
    if (!isValidObjectId(bookingId)) return;

    const booking = await this.shuttleServicesModel.findById(bookingId);
    if (!booking) return;

    // ── Idempotency guard ────────────────────────────────────────────────────
    // If we already processed this payment (e.g. webhook replayed), skip.
    if (booking.paymentVerified) {
      this.logger.log(`Webhook skipped: booking ${bookingId} already verified`);
      return;
    }

    // ── Reference guard ──────────────────────────────────────────────────────
    if (event.data.reference !== booking.paymentReference) {
      this.logger.warn(`Webhook reference mismatch for booking ${bookingId}`);
      return;
    }

    // ── Expired booking path ─────────────────────────────────────────────────
    // Payment arrived but the 15-minute reservation window has closed.
    // We must refund the user — DO NOT mark as PAID.
    if (booking.expiresAt.getTime() < Date.now()) {
      this.logger.warn(
        `Webhook: payment received for expired booking ${bookingId}`,
      );
      await this.handleLatePaymentForExpiredBooking(booking, event);
      return;
    }

    // ── Amount guard ─────────────────────────────────────────────────────────
    const expectedAmount = booking.totalAmount * 100;
    const receivedAmount = Number(event.data.amount);

    if (!Number.isFinite(receivedAmount) || receivedAmount !== expectedAmount) {
      this.logger.warn(
        `Webhook amount mismatch for booking ${bookingId}: expected ${expectedAmount}, got ${receivedAmount}`,
      );
      return;
    }

    // ── Confirm payment (inside a transaction for atomicity) ─────────────────
    //
    // If the audit log write fails, the booking update rolls back.
    // Paystack will retry the webhook and we'll process it cleanly next time.

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.shuttleServicesModel.updateOne(
        {
          _id: new Types.ObjectId(bookingId),
          status: ShuttleBookingStatus.RESERVED, // must still be RESERVED
          paymentVerified: false, // must not already be verified
          paymentReference: event.data.reference, // must match our reference
        },
        {
          $set: {
            status: ShuttleBookingStatus.PAID,
            paymentVerified: true,
            paidAt: new Date(event.data.paid_at ?? Date.now()),
          },
        },
        { session },
      );

      if (result.modifiedCount === 0) {
        // Nothing was updated — either already PAID, wrong status, or reference mismatch.
        // Safe to abort quietly; the booking state is already correct.
        await session.abortTransaction();
        return;
      }

      // Log the successful payment — inside the same transaction so it rolls back together
      await this.auditService.log('SHUTTLE_SERVICE_PAYMENT_SUCCESS', {
        bookingId: new Types.ObjectId(bookingId),
        reference: event.data.reference,
        amount: receivedAmount,
      });

      await session.commitTransaction();

      this.logger.log(
        `Shuttle booking ${bookingId} confirmed — ₦${booking.totalAmount.toLocaleString()}`,
      );
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Webhook transaction failed for booking ${bookingId}`,
        error,
      );
      // Re-throw so the webhook returns a non-200 — Paystack will retry
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /* ============================================================
      LATE PAYMENT HANDLER (expired booking received payment)
      Isolated from the main success path to keep logic clean.
  ============================================================ */

  private async handleLatePaymentForExpiredBooking(
    booking: ShuttleDocument,
    event: PaystackWebhookEvent,
  ) {
    const bookingId = booking._id.toString();
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    // Notify admin
    if (adminEmail) {
      await this.notificationService.sendEmail({
        to: adminEmail,
        subject: 'Payment received for expired shuttle booking',
        template: 'admin-expired-booking',
        context: {
          bookingId,
          amount: event.data.amount / 100,
          reference: event.data.reference,
          customerEmail: event.data.customer?.email ?? 'N/A',
        },
      });
    }

    // Notify customer
    const user = await this.userModel
      .findById(booking.userId)
      .select('email')
      .lean();

    if (user?.email) {
      await this.notificationService.sendEmail({
        to: user.email,
        subject: 'Your shuttle booking expired — refund initiated',
        template: 'user-expired-booking',
        context: {
          bookingId,
          amount: event.data.amount / 100,
          reference: event.data.reference,
        },
      });
    }

    // Trigger refund
    await this.paystackService.refundTransaction({
      reference: event.data.reference,
    });

    // Mark booking so we know a refund was triggered (prevents double-refund on replay)
    await this.shuttleServicesModel.updateOne(
      { _id: booking._id, paymentVerified: false },
      { $set: { status: ShuttleBookingStatus.REFUND_PENDING } },
    );

    // Audit trail for the late payment + refund
    await this.auditService.log('SHUTTLE_SERVICE_PAYMENT_EXPIRED_REFUNDED', {
      bookingId: new Types.ObjectId(bookingId),
      reference: event.data.reference,
    });

    this.logger.warn(`Late payment refunded for expired booking ${bookingId}`);
  }

  /* ============================================================
      MANUAL VERIFY — SHUTTLE SERVICES
      Called by verifyPayment when metadata.source === 'shuttle-services'.
      Safety net when webhook was delayed or missed.
  ============================================================ */

  private async verifyShuttleServicesManually(
    bookingId: string,
    paystackResponse: PaystackVerifyResponse,
  ) {
    const booking = await this.shuttleServicesModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    // Already confirmed — idempotent success
    if (booking.paymentVerified) {
      return { success: true };
    }

    // ── Expiry check ─────────────────────────────────────────────────────────
    // The booking window expired before the webhook arrived.
    // The webhook handler already handles 'late payment + refund'.
    // If we're here and it's expired, something unusual happened — surface it.
    if (booking.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'Booking reservation has expired. If payment was taken, a refund will be processed.',
      );
    }

    // ── Amount check ─────────────────────────────────────────────────────────
    const expected = booking.totalAmount * 100;
    if (Number(paystackResponse.data.amount) !== expected) {
      throw new BadRequestException('Payment amount does not match booking');
    }

    // ── Confirm ──────────────────────────────────────────────────────────────
    booking.status = ShuttleBookingStatus.PAID;
    booking.paymentVerified = true;
    booking.paidAt = new Date();
    await booking.save();

    await this.auditService.log('SHUTTLE_SERVICE_PAYMENT_VERIFIED_MANUALLY', {
      bookingId: new Types.ObjectId(bookingId),
      reference: paystackResponse.data.reference,
    });

    return { success: true };
  }

  /* ============================================================
      WEBHOOK HANDLER — NORMAL BOOKINGS
  ============================================================ */

  private async handleBookingPayment(
    bookingId: string,
    event: PaystackWebhookEvent,
  ) {
    if (!isValidObjectId(bookingId)) return;

    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) return;

    // Reference guard
    if (event.data.reference !== booking.paymentReference) return;

    // Amount guard
    const expectedAmount = Number(booking.price) * 100;
    if (
      !Number.isFinite(Number(event.data.amount)) ||
      Number(event.data.amount) !== expectedAmount
    ) {
      return;
    }

    // Idempotent update — only applies if not already PAID
    await this.bookingModel.updateOne(
      {
        _id: bookingId,
        status: { $ne: BookingStatus.PAID },
      },
      {
        $set: {
          status: BookingStatus.PAID,
          paidAt: new Date(event.data.paid_at ?? Date.now()),
        },
      },
    );

    // Audit trail (was missing in the original)
    await this.auditService.log('BOOKING_PAYMENT_SUCCESS', {
      bookingId: new Types.ObjectId(bookingId),
      reference: event.data.reference,
    });
  }
}
