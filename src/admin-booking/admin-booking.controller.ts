import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { AdminBookingService } from './admin-booking.service';
import { CreateAdminBookingDto } from './dto/create-admin-booking.dto';
import { Request } from 'express';
import { JwtUser } from '../admin/jwt.admin.types';
import { SearchBookingDto } from './dto/search-booking.dto';

@Controller('booking/admin')
export class AdminBookingController {
  constructor(private readonly adminBookingService: AdminBookingService) {}

  // ADMIN CREATE BOOKING
  @UseGuards(JwtAdminGuard)
  @Post('create')
  async createAdminBooking(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: CreateAdminBookingDto,
  ) {
    const adminId = req.user._id;
    return this.adminBookingService.createAdminBooking(adminId, dto);
  }

  // GET ALL ADMIN BOOKINGS
  @UseGuards(JwtAdminGuard)
  @Get('all')
  async getAdminBookings() {
    return this.adminBookingService.getAdminBookings();
  }

  //Search for Bookings
  @Get('trips')
  async getAllBookings(@Query() field: SearchBookingDto) {
    return this.adminBookingService.getAllBooking(field);
  }
}
