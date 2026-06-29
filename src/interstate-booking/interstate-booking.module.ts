// src/interstate-booking/interstate-booking.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterstateBookingController } from './interstate-booking.controller';
import { InterstateBookingService } from './interstate-booking.service';
import {
  InterstateBooking,
  InterstateBookingSchema,
} from './schema/interstate-booking.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InterstateBooking.name, schema: InterstateBookingSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [InterstateBookingController],
  providers: [InterstateBookingService],
})
export class InterstateBookingModule {}
