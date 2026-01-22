import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CreateUserBookingDto } from './dto/create-user-booking.dto';
import { UserBookingService } from './user-booking.service';
import { SearchBookingDto } from './dto/search-booking.dto';
import { anotherUserBookingDto } from './dto/another-user-booking.dto';

@Controller('booking/user')
export class UserBookingController {
  constructor(private readonly userBookingService: UserBookingService) {}

  @Post('create')
  async createBooking(@Body() dto: CreateUserBookingDto) {
    const booking = await this.userBookingService.createUserBooking(dto);

    return {
      success: true,
      booking,
    };
  }

  // Another user booking
  @Post('another')
  async anotherUserBooking(@Body() dto: anotherUserBookingDto) {
    const booking = await this.userBookingService.anotherUserBooking(dto);

    return {
      success: true,
      booking,
    };
  }

  @Get('trips')
  async searchTrips(@Query() query: SearchBookingDto) {
    return this.userBookingService.searchTrips(query);
  }
}
