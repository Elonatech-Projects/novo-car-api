// Booking.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  //   ValidationPipe,
} from '@nestjs/common';
import { BookingsService } from './booking.service';
import { CreateUserBookingDto } from './dto/create-user-booking.dto';

@Controller('shuttle-bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // CREATE USER BOOKING
  @Post('create')
  async createUserBooking(@Body() dto: CreateUserBookingDto) {
    return this.bookingsService.createUserBooking(dto);
  }

  // GET BOOKING BY ID
  @Get(':id')
  async getBooking(@Param('id') id: string) {
    return this.bookingsService.getBookingById(id);
  }
}
