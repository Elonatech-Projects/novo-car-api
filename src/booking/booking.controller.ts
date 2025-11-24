import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createBooking(@Req() req, @Body() dto: CreateBookingDto) {
    const userId = req.user._id;
    return this.bookingService.createBooking(userId, dto);
  }
}
