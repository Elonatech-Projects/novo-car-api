import { forwardRef, Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaystackService } from './paystack.service';
import { BookingsModule } from '../bookings/bookings.module';
import { PaystackWebhookController } from './webhook.controller';
import { AdminBookingModule } from '../admin-booking/admin-booking.module';

@Module({
  imports: [BookingsModule, forwardRef(() => AdminBookingModule)],
  controllers: [PaymentsController, PaystackWebhookController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaymentsModule {}
