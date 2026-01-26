import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './booking.service';
import { BookingsController } from './booking.controller';
import { UserBooking, UserBookingSchema } from './schema/user-booking.schema';
import { Trip, TripSchema } from '../trips/schema/trip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserBooking.name, schema: UserBookingSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingModule {}
