import {
  Controller,
  Post,
  Headers,
  BadRequestException,
  Req,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
// import { BookingsService } from '../bookings/bookings.service';
// import { PaymentMethod, PaymentStatus } from '../bookings/types/payment.type';
import { PaystackBookingsService } from '../paystack-bookings/paystack-bookings.service';

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
      bookingId?: string;
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

  constructor(
    @Inject(forwardRef(() => PaystackBookingsService))
    private readonly bookingsService: PaystackBookingsService,
  ) {}

  @Post()
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RequestWithRawBody,
  ) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret)
      throw new BadRequestException('Paystack secret key not configured');
    if (!signature) throw new BadRequestException('Missing signature header');
    if (!req.rawBody) throw new BadRequestException('Raw body is required');

    // Verify signature
    const computedHash = crypto
      .createHmac('sha512', secret)
      .update(req.rawBody)
      .digest('hex');

    if (computedHash !== signature)
      throw new BadRequestException('Invalid webhook signature');

    let payload: PaystackWebhookPayload;
    try {
      payload = JSON.parse(req.rawBody);
    } catch {
      throw new BadRequestException('Invalid JSON payload');
    }

    if (payload.event !== 'charge.success') {
      return { received: true, message: 'Event not processed' };
    }

    if (payload.data.status !== 'success') {
      return { received: true, message: 'Payment not successful' };
    }

    // Extract booking ID
    let bookingId = payload.data.metadata?.bookingId;
    if (!bookingId && payload.data.metadata?.custom_fields) {
      const field = payload.data.metadata.custom_fields.find(
        (f) => f.variable_name === 'bookingId',
      );
      bookingId = field?.value;
    }

    if (!bookingId)
      throw new BadRequestException('bookingId missing in Paystack metadata');

    // Update booking payment
    // await this.bookingsService.updatePayment(bookingId, {
    //   method: PaymentMethod.PAYSTACK,
    //   amount: payload.data.amount / 100,
    //   status: PaymentStatus.SUCCESS,
    //   verified: true,
    //   reference: payload.data.reference,
    //   paystackReference: payload.data.reference,
    //   verifiedAt: new Date(),
    // });

    return {
      received: true,
      message: 'Payment processed successfully',
      bookingId,
      amount: payload.data.amount / 100,
    };
  }
}
