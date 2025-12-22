import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Bookings, BookingSchema } from './schemas/bookings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bookings.name, schema: BookingSchema }]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService], // IMPORTANT for payments
})
export class BookingsModule {}
