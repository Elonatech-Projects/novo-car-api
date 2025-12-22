import {
  Controller,
  Post,
  Headers,
  Body,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentMethod, PaymentStatus } from '../bookings/types/payment.type';

interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
  };
}

@Controller('payments/webhook')
export class PaystackWebhookController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() payload: PaystackWebhookPayload,
  ) {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (
      payload.event === 'charge.success' &&
      payload.data.status === 'success'
    ) {
      const reference = payload.data.reference;

      await this.bookingsService.updatePayment(reference, {
        method: PaymentMethod.PAYSTACK,
        amount: payload.data.amount,
        status: PaymentStatus.SUCCESS,
        verified: true,
        paystackReference: reference,
      });
    }

    return { received: true };
  }
}
