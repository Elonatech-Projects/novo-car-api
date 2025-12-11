import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtUser } from '../auth/jwt.types';
import { Request } from 'express';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

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

  @UseGuards(JwtAdminGuard)
  @Get('find-all-bookings')
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }
}
