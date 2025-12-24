import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  // Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserBookingService } from './user-booking.service';
// import { CreateBookingDto } from './dto/create-admin-booking.dto';
import { JwtUser } from '../auth/jwt.types';
import { Request } from 'express';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
// import { SearchBookingDto } from './dto/search-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
// import { CreateAdminBookingDto } from '../admin-booking/dto/create-admin-booking.dto';

@Controller('booking')
export class UserBookingController {
  constructor(private readonly bookingService: UserBookingService) {}

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

  // @UseGuards(JwtAdminGuard)
  @Get('search')
  // async searchBookings(@Query() search: SearchBookingDto) {
  //   return this.bookingService.searchBookings(search);
  // }
  @UseGuards(JwtAdminGuard)
  @Get('find-all-bookings')
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }
}
