import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PaystackBookingSchema,
  PaystackBookings,
} from './schema/paystack-bookings.schema';
import { PaystackBookingsController } from './paystack-bookings.controller';
import { PaystackBookingsService } from './paystack-bookings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PaystackBookings.name,
        schema: PaystackBookingSchema,
      },
    ]),
  ],
  controllers: [PaystackBookingsController],
  providers: [PaystackBookingsService],
  exports: [PaystackBookingsService],
})
export class PaystackBookingsModule {}
