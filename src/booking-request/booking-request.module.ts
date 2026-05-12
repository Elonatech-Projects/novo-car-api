// booking-request.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  BookingRequest,
  BookingRequestSchema,
} from './schema/booking-request.schema';
import { BookingRequestService } from './booking-request.service';
import { BookingRequestController } from './booking-request.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BookingRequest.name, schema: BookingRequestSchema },
    ]),
    NotificationsModule, // ✅ THIS IS THE FIX
  ],
  controllers: [BookingRequestController],
  providers: [BookingRequestService],
})
export class BookingRequestModule {}
