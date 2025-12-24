import {
  Controller,
  Post,
  Headers,
  BadRequestException,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentMethod, PaymentStatus } from '../bookings/types/payment.type';

interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number; // in kobo
    status: 'success' | 'failed';
    metadata?: {
      bookingReference?: string;
    };
  };
}

@Controller('payments/webhook')
export class PaystackWebhookController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: Request,
  ) {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      throw new BadRequestException('Paystack secret key not configured');
    }

    /** ✅ VERIFY SIGNATURE USING RAW BODY */
    const hash = crypto
      .createHmac('sha512', secret)
      .update(req.body as Buffer) // 🔥 RAW BUFFER
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    /** ✅ PARSE RAW PAYLOAD */
    const payload = JSON.parse(
      (req.body as Buffer).toString(),
    ) as PaystackWebhookPayload;

    /** ✅ ONLY HANDLE SUCCESSFUL PAYMENTS */
    if (
      payload.event !== 'charge.success' ||
      payload.data.status !== 'success'
    ) {
      return { received: true };
    }

    const bookingReference = payload.data.metadata?.bookingReference;

    if (!bookingReference) {
      throw new BadRequestException(
        'bookingReference missing in Paystack metadata',
      );
    }

    /** ✅ UPDATE PAYMENT */
    await this.bookingsService.updatePayment(bookingReference, {
      method: PaymentMethod.PAYSTACK,
      amount: payload.data.amount / 100, // kobo → naira
      status: PaymentStatus.SUCCESS,
      verified: true,
      reference: payload.data.reference,
      paystackReference: payload.data.reference,
    });

    return { received: true };
  }
}
