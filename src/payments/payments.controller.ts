// src/payments/payments.controller.ts
import {
  Controller,
  Post,
  Param,
  Get,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize/:bookingId')
  async initializePayment(@Param('bookingId') bookingId: string) {
    return this.paymentsService.initializePayment(bookingId);
  }

  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  // 🚀 PRODUCTION-READY WEBHOOK
  // In PaymentsController class

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: any, // Changed to 'any' to access rawBody
    @Headers('x-paystack-signature') signature: string,
  ) {
    const startTime = Date.now();

    try {
      // Get raw body from our middleware
      const rawBody = req.rawBody;

      if (!rawBody) {
        this.logger.error('[Webhook] ❌ rawBody is undefined!');
        return { received: false };
      }

      this.logger.log(`[Webhook] 📨 Received - ${rawBody.length} bytes`);

      await this.paymentsService.handlePaystackWebhook(signature, rawBody);

      const duration = Date.now() - startTime;
      this.logger.log(`[Webhook] ✅ Processed in ${duration}ms`);

      return { received: true };
    } catch (error) {
      this.logger.error(`[Webhook] ❌ Error:`, error.message);
      return { received: true }; // Still return 200
    }
  }

  // ShuttleBooking Route
  @Post('initialize/shuttle/:shuttleBookingId')
  async initializeShuttlePayment(
    @Param('shuttleBookingId') shuttleBookingId: string,
  ) {
    return this.paymentsService.initializeShuttleBookingPayment(
      shuttleBookingId,
    );
  }
}
