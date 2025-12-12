import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminBooking.name, schema: AdminBookingSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [AdminBookingController],
  providers: [AdminBookingService],
})
export class AdminBookingModule {}
