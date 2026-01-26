import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaystackService } from './paystack.service';
import { BookingStatus, UserBooking } from '../booking/schema/user-booking.schema';
import * as crypto from 'crypto';
@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBooking>,

    private readonly paystackService: PaystackService,
  ) {}

  // 1️⃣ Initialize Payment
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

    const reference = `BOOKING_${Date.now()}`;

    const paystackResponse = await this.paystackService.initializeTransaction({
      email: booking.email,
      amount: Number(booking.price) * 100, // kobo
      reference,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    booking.paymentReference = reference;
    await booking.save();

    return {
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
    };
  }

  // 2️⃣ Verify Payment
  async verifyPayment(reference: string) {
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

    return {
      success: true,
      bookingId: booking._id,
      status: booking.status,
      paidAt: booking.paidAt,
    };
  }

  // Payment Webhook
  async handlePaystackWebhook(signature: string, rawBody: Buffer) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('[Webhook] Missing PAYSTACK secret key!');
      throw new BadRequestException('Paystack secret key not defined');
    }
    const payload = JSON.stringify({
      event: 'charge.sucess',
      data: {
        reference: 'BOOKING_1769437492110',
        metadata: { bookingId: '697778d6658bc921f0575e28' },
      },
    });
    const hash = crypto
      .createHmac('sha512', secret)
      .update(payload)
      .digest('hex');
    console.log('[Webhook] Computed hash:', hash);
    console.log('[Webhook] Received signature:', signature);

    if (hash !== signature) {
      console.warn('[Webhook] Signature mismatch!');
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString());
    console.log('[Webhook] Event payload:', JSON.stringify(event, null, 2));

    if (event.event !== 'charge.success') {
      console.log('[Webhook] Event not charge.success, ignoring');
      return { received: true };
    }

    const bookingId = event.data.metadata?.bookingId;
    if (!bookingId) {
      console.warn('[Webhook] Missing bookingId in metadata!');
      throw new BadRequestException('Missing bookingId');
    }

    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      console.warn('[Webhook] Booking not found:', bookingId);
      throw new BadRequestException('Booking not found');
    }

    if (booking.status === BookingStatus.PAID) {
      console.log('[Webhook] Booking already PAID:', bookingId);
      return { received: true };
    }

    booking.status = BookingStatus.PAID;
    booking.paidAt = new Date();
    await booking.save();

    console.log('[Webhook] Booking payment updated:', bookingId);

    return { received: true };
  }

}
