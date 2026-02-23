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
// import { AuditService } from '../audit/audit.service';
import { AuditModule } from '../audit/audit.module';
import {
  Shuttle,
  ShuttleServicesSchema,
} from '../shuttle-services/schema/shuttle-service.schema';
import { Auth } from '../auth/schema/auth-schema';
// import { HttpModule } from '@nestjs/axios';
// import { AnotherBooking, AnotherBookingSchema } from '../admin-booking/schema/another-booking.schema';

@Module({
  imports: [
    // HttpModule,
    NotificationsModule,
    AuditModule,
    MongooseModule.forFeature([
      { name: UserBooking.name, schema: UserBookingSchema },
      { name: ShuttleBooking.name, schema: ShuttleBookingSchema },
      { name: Shuttle.name, schema: ShuttleServicesSchema },
      { name: Auth.name, schema: Auth },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaystackService],
})
export class PaymentsModule {}
