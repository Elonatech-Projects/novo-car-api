import { forwardRef, Module } from '@nestjs/common';
import { AdminBookingService } from './admin-booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdminBooking,
  AdminBookingSchema,
  // AdminBookingSchema,
  // createAdminBooking,
} from './schema/adminbooking.schema';
import { AdminBookingController } from './admin-booking.controller';
import { Admin, AdminSchema } from '../admin/schema/admin-schema';
import { PaymentsModule } from '../payments/payments.module';
import { UserBooking, UserBookingSchema } from './schema/user-booking.schema';
import { UserBookingController } from './user-booking.controller';
import { PaystackService } from '../payments/paystack.service';
import { UserBookingService } from './user-booking.service';
import {
  AnotherBooking,
  AnotherBookingSchema,
} from './schema/another-booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminBooking.name, schema: AdminBookingSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: UserBooking.name, schema: UserBookingSchema },
      { name: AnotherBooking.name, schema: AnotherBookingSchema },
    ]),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [AdminBookingController, UserBookingController],
  providers: [AdminBookingService, PaystackService, UserBookingService],
  exports: [AdminBookingService],
})
export class AdminBookingModule {}
