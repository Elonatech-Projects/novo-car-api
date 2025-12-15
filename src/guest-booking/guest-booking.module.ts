import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuestBookingService } from './guest-booking.service';
import { GuestBookingController } from './guest-booking.controller';
import {
  GuestBooking,
  GuestBookingSchema,
} from './schema/guest-booking.schema';
// import {
//   GuestBooking,
//   GuestBookingSchema,
// } from './schemas/guest-booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GuestBooking.name, schema: GuestBookingSchema },
    ]),
  ],
  controllers: [GuestBookingController],
  providers: [GuestBookingService],
})
export class GuestBookingModule {}
