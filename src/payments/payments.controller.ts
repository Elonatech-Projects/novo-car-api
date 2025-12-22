import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentMethod, PaymentStatus } from '../bookings/types/payment.type';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly bookingsService: BookingsService,
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
}
