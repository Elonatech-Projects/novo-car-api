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
  Body,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RequestRefundDto } from './dto/request-refund.dto';
import type { RequestWithRawBody } from '../common/interfaces/request-with-raw-body';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

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
    @Req() req: RequestWithRawBody,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const startTime = Date.now();

    try {
      const { rawBody } = req;

      if (!rawBody || rawBody.length === 0) {
        this.logger.error('[Webhook] ❌ rawBody missing');
        return { received: false };
      }

      this.logger.log(`[Webhook] 📨 ${rawBody.length} bytes received`);

      await this.paymentsService.handlePaystackWebhook(signature, rawBody);

      this.logger.log(`[Webhook] ✅ Processed in ${Date.now() - startTime}ms`);

      return { received: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown webhook error';

      this.logger.error(`[Webhook] ❌ ${message}`);
      return { received: true }; // ALWAYS 200
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

  @Post('refund')
  async requestRefund(@Body() dto: RequestRefundDto) {
    return this.paymentsService.requestRefund(
      dto.source,
      dto.sourceId,
      dto.reason,
    );
  }

  @Get('refund/verify/:reference')
  async verifyRefund(@Param('reference') reference: string) {
    return this.paymentsService.verifyRefundStatus(reference);
  }

  @Post('refund/approve/:id')
  @UseGuards(JwtAdminGuard)
  async approveRefund(@Param('id') id: string) {
    return this.paymentsService.approveRefund(id);
  }
}
