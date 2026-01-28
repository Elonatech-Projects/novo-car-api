// Payments Controller
import {
  Controller,
  Post,
  Param,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  Headers,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 🔹 Initialize payment
  @Post('initialize/:bookingId')
  async initializePayment(@Param('bookingId') bookingId: string) {
    return this.paymentsService.initializePayment(bookingId);
  }

  // 🔹 Verify payment manually (Paystack redirect / frontend call)
  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  // 🔹 Paystack Webhook
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    // ✅ req.body is already a Buffer because of bodyParser.raw()
    const rawBody = req.body;
    return this.paymentsService.handlePaystackWebhook(signature, rawBody);
  }
}
