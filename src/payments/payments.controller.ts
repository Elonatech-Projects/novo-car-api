// Payments Controller: Handles payment verification and updates booking payment status accordingly.
// payments.controller.ts
import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Post,
  Req,
  forwardRef,
  Inject,
  Body,
} from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentMethod, PaymentStatus } from '../bookings/types/payment.type';
import * as crypto from 'crypto';
import { AdminBookingService } from '../admin-booking/admin-booking.service';
import { Headers } from '@nestjs/common';
import { InitializePaymentDto } from './dto/payment-dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly bookingsService: BookingsService,
    @Inject(forwardRef(() => AdminBookingService))
    private readonly adminBookingService: AdminBookingService,
  ) {}

  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    const response = await this.paystackService.verifyTransaction(reference);

    if (!response.status || response.data.status !== 'success') {
      throw new BadRequestException('Payment verification failed');
    }

    return this.bookingsService.updatePayment(response.data.reference, {
      method: PaymentMethod.PAYSTACK,
      amount: response.data.amount,
      status: PaymentStatus.SUCCESS,
      verified: true,
      paystackReference: reference,
    });
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Headers() headers: Record<string, string>,
  ) {
    const signature = headers['x-paystack-signature'];
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      return { status: false, message: 'Invalid signature' };
    }

    const event: any = req.body;

    if (event && event.event === 'charge.success') {
      const reference = event.data.reference;
      await this.adminBookingService.updateBookingPaymentStatus(reference, 'PAID');
    }

    return { status: true };
  }

  @Post('initialize')
  async initializePayment(@Body() body: InitializePaymentDto) {
    return this.paystackService.initializeTransaction({
      email: body.email,
      amount: body.amount,
      reference: body.reference,
    });
  }
}
