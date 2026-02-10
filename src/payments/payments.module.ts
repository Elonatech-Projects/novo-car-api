import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaystackService } from './paystack.service';
import {
  UserBooking,
  UserBookingSchema,
} from '../booking/schema/user-booking.schema';
import {
  ShuttleBooking,
  ShuttleBookingSchema,
} from '../shuttle-booking/schema/shuttle-booking.schema';
// import { NotificationService } from '../notifications/notifications.service';
import { NotificationsModule } from '../notifications/notifications.module';
// import { HttpModule } from '@nestjs/axios';
// import { AnotherBooking, AnotherBookingSchema } from '../admin-booking/schema/another-booking.schema';

@Module({
  imports: [
    // HttpModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: UserBooking.name, schema: UserBookingSchema },
      { name: ShuttleBooking.name, schema: ShuttleBookingSchema },
      // { name: AnotherBooking.name, schema: AnotherBookingSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaystackService],
})
export class PaymentsModule {}
