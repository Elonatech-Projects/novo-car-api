import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtUser } from '../auth/jwt.types';
import { Request } from 'express';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: CreateBookingDto,
  ) {
    const userId = req.user._id;
    console.log('user-id for booking', userId);
    return this.bookingService.createBooking(userId, dto);
  }
}
