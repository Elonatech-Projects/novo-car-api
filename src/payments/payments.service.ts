// PaymentsService: Handles all payment-related operations, including:
// - Initializing payments with Paystack
// - Verifying payments (manual and webhook)
// - Processing refunds
// - Logging and auditing payment events
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
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
// import { PaystackVerifyResponse } from './types/paystack.types';
import { PaymentSource, PaystackVerifyResponse } from './types/paystack.types';

type PaystackMetadata = {
  bookingId?: string;
  source?: PaymentSource;
  sourceId?: string;
};
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Auth.name) private readonly userModel: Model<Auth>,
    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBooking>,
    @InjectModel(ShuttleBooking.name)
    private readonly shuttleBookingModel: Model<ShuttleBookingDocument>,
    @InjectModel(Shuttle.name)
    private readonly shuttleServicesModel: Model<ShuttleDocument>,
    private readonly paystackService: PaystackService,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  /* ======================================================
      INITIALIZE — NORMAL BOOKING
  ====================================================== */
  async initializePayment(bookingId: string) {
    if (!isValidObjectId(bookingId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const booking = await this.bookingModel.findById(bookingId);

    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.email) throw new BadRequestException('Booking email missing');
    if (booking.status === BookingStatus.PAID)
      throw new BadRequestException('Booking already paid');

    const amount = Number(booking.price);
    if (!Number.isFinite(amount) || amount <= 0)
      throw new BadRequestException('Invalid booking price');

    const reference = `NOVO-${bookingId.slice(-8)}-${Date.now()}`;

    const response = await this.paystackService.initializeTransaction({
      email: booking.email,
      amount: amount * 100,
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

  /* ======================================================
      INITIALIZE — SHUTTLE SERVICES
  ====================================================== */
  async initializeShuttleServicesPayment(bookingId: string) {
    if (!isValidObjectId(bookingId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const booking = await this.shuttleServicesModel.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === ShuttleBookingStatus.PAID) {
      throw new BadRequestException('Booking already paid');
    }

    if (booking.status !== ShuttleBookingStatus.RESERVED) {
      throw new BadRequestException('Booking not eligible for payment');
    }

    if (booking.paymentReference) {
      throw new BadRequestException('Payment already initialized');
    }

    if (booking.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Booking expired');
    }

    if (!Number.isFinite(booking.totalAmount) || booking.totalAmount <= 0) {
      throw new BadRequestException('Invalid booking amount');
    }

    const user = await this.userModel
      .findById(booking.userId)
      .select('email')
      .lean();

    if (!user?.email) {
      throw new BadRequestException('User email not found');
    }

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

    booking.paymentReference = reference;
    await booking.save();

    return {
      success: true,
      authorizationUrl: response.data.authorization_url,
      reference,
    };
  }

  /* ======================================================
      VERIFY (MANUAL FALLBACK)
  ====================================================== */
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

    const booking = await this.bookingModel.findById(metadata.sourceId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.status === BookingStatus.PAID) {
      return { success: true };
    }

    const expected = Number(booking.price) * 100;
    if (Number(paystackResponse.data.amount) !== expected)
      throw new BadRequestException('Amount mismatch');

    booking.status = BookingStatus.PAID;
    booking.paidAt = new Date();
    await booking.save();

    return { success: true };
  }

  /* ======================================================
      WEBHOOK (PRIMARY)
  ====================================================== */
  async handlePaystackWebhook(signature: string, rawBody: Buffer) {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!secret || !signature || !rawBody) return;

    const computedHash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    const isValid =
      computedHash.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(signature));

    if (!isValid) return;

    const event = JSON.parse(rawBody.toString()) as PaystackWebhookEvent;

    if (event.event !== 'charge.success') return;

    const metadata = event?.data?.metadata;

    if (
      !metadata ||
      typeof metadata !== 'object' ||
      !metadata.source ||
      !metadata.sourceId
    ) {
      return;
    }

    if (!event.data.reference?.startsWith('NOVO-')) {
      return;
    }

    if (metadata.source === 'booking') {
      await this.handleBookingPayment(metadata.sourceId, event);
    }

    if (metadata.source === 'shuttle-services') {
      await this.handleShuttleServicesPayment(metadata.sourceId, event);
    }
  }

  /* ======================================================
      SHUTTLE WEBHOOK HANDLER
  ====================================================== */
  private async handleShuttleServicesPayment(
    bookingId: string,
    event: PaystackWebhookEvent,
  ) {
    if (!isValidObjectId(bookingId)) return;

    const booking = await this.shuttleServicesModel.findById(bookingId);
    if (!booking) return;

    if (booking.paymentVerified) return;

    if (booking.expiresAt.getTime() < Date.now()) return;

    if (event.data.reference !== booking.paymentReference) return;

    const expectedAmount = booking.totalAmount * 100;

    if (
      !Number.isFinite(Number(event.data.amount)) ||
      Number(event.data.amount) !== expectedAmount
    ) {
      return;
    }

    const result = await this.shuttleServicesModel.updateOne(
      {
        _id: bookingId,
        status: ShuttleBookingStatus.RESERVED,
        paymentVerified: false,
      },
      {
        $set: {
          status: ShuttleBookingStatus.PAID,
          paymentVerified: true,
          paidAt: new Date(event.data.paid_at ?? Date.now()),
        },
      },
    );

    if (result.modifiedCount === 0) return;

    await this.auditService.log('SHUTTLE_SERVICE_PAYMENT_SUCCESS', {
      bookingId: new Types.ObjectId(bookingId),
    });
  }

  private async verifyShuttleServicesManually(
    bookingId: string,
    paystackResponse: PaystackVerifyResponse,
  ) {
    const booking = await this.shuttleServicesModel.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.paymentVerified) {
      return { success: true };
    }

    const expected = booking.totalAmount * 100;

    if (Number(paystackResponse.data.amount) !== expected) {
      throw new BadRequestException('Amount mismatch');
    }

    booking.status = ShuttleBookingStatus.PAID;
    booking.paymentVerified = true;
    booking.paidAt = new Date();

    await booking.save();

    return { success: true };
  }

  private async handleBookingPayment(
    bookingId: string,
    event: PaystackWebhookEvent,
  ) {
    if (!isValidObjectId(bookingId)) return;

    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) return;

    if (event.data.reference !== booking.paymentReference) return;

    const expectedAmount = Number(booking.price) * 100;

    if (
      !Number.isFinite(Number(event.data.amount)) ||
      Number(event.data.amount) !== expectedAmount
    ) {
      return;
    }

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
  }
}
