import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingsDto } from './dto/create-bookings.dto';
import { JwtUser } from '../auth/jwt.types';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * CREATE BOOKING
   * - Guest: req.user is undefined
   * - Logged-in user: req.user exists
   */
  @Post('create')
  async create(
    @Body() createBookingDto: CreateBookingsDto,
    @Req() req: Request & { user?: JwtUser },
  ) {
    // if user is logged in, attach userId
    if (req.user) {
      createBookingDto.userId = req.user._id;
    }

    return this.bookingsService.create(createBookingDto);
  }

  /**
   * GET BOOKINGS
   * - Logged-in: returns only their bookings
   * - Guest/Admin: returns all bookings
   */
  @Get()
  async findAll(@Req() req: Request & { user?: JwtUser }) {
    return this.bookingsService.findAll(req.user?._id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post('send-confirmation')
  async sendConfirmation(@Body() body: { email: string; bookingId: string }) {
    await this.bookingsService.sendConfirmationEmail(
      body.email,
      body.bookingId,
    );

    return { message: 'Confirmation email sent' };
  }
}
