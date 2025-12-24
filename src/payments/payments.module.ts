import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaystackService } from './paystack.service';
import { BookingsModule } from '../bookings/bookings.module';
import { PaystackWebhookController } from './webhook.controller';

@Module({
  imports: [BookingsModule],
  controllers: [PaymentsController, PaystackWebhookController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaymentsModule {}
