import { forwardRef, Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaystackService } from './paystack.service';
// import { BookingsModule } from '../bookings/bookings.module';
import { PaystackWebhookController } from './webhook.controller';
// import { AdminBookingModule } from '../admin-booking/admin-booking.module';
import { PaymentsService } from './payments.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserBooking,
  UserBookingSchema,
} from '../user-booking/schema/user-booking.schema';
import { ConfigModule } from '@nestjs/config';
import { BookingsModule } from '../bookings/bookings.module';
import {
  AnotherBooking,
  AnotherBookingSchema,
} from '../admin-booking/schema/another-booking.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: UserBooking.name,
        schema: UserBookingSchema,
      },
      {
        name: AnotherBooking.name,
        schema: AnotherBookingSchema,
      },
    ]),
    // BookingsModule,
    forwardRef(() => BookingsModule),
  ],
  controllers: [PaymentsController, PaystackWebhookController],
  providers: [PaystackService, PaymentsService],
  exports: [PaystackService],
})
export class PaymentsModule {}
