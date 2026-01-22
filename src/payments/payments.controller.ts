import { Controller, Post, Body } from '@nestjs/common';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  async initializePayment(@Body() dto: InitializePaymentDto) {
    return this.paymentsService.initializePayment(dto.bookingId);
  }

  @Post('initialize-another')
  async initializeAnotherPayment(@Body() dto: InitializePaymentDto) {
    return this.paymentsService.initializeAnotherPayment(dto.bookingId);
  }

  @Post('verify')
  async verifyPayment(@Body() dto: { reference: string }) {
    return this.paymentsService.verifyPayment(dto.reference);
  }
}
