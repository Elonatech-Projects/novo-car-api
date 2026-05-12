// booking-request.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { BookingRequestService } from './booking-request.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';

@Controller('booking-request')
export class BookingRequestController {
  constructor(private readonly service: BookingRequestService) {}

  @Post()
  async create(@Body() dto: CreateBookingRequestDto) {
    await this.service.create(dto);

    return {
      message: 'Booking request submitted successfully',
    };
  }
}
