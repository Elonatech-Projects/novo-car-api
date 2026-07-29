import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PaystackBookingsService } from './paystack-bookings.service';
// import { JwtUser } from '../admin/jwt.admin.types';
import { JwtUser } from '../auth/jwt.types';
import { CreatePaystackBookingsDto } from './dto/create-paystack-bookings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('paystack-bookings')
export class PaystackBookingsController {
  constructor(
    private readonly PaystackBookingsService: PaystackBookingsService,
  ) {}
  @Post('create')
  async createBooking(
    @Body() createBookingDto: CreatePaystackBookingsDto,
    @Req() req: Request & { user?: JwtUser },
  ) {
    // if user is logged in, attach userId
    if (req.user) {
      createBookingDto.userId = req.user._id;
    }

    return this.PaystackBookingsService.create(createBookingDto);
  }

  // Both were unguarded — `findAll` is written to filter by req.user._id,
  // but with no guard Passport never populates req.user, so it silently
  // returned unfiltered data to anyone. These are customer bookings (not
  // admin data), so the regular-user guard is the right fit, not the admin
  // one — `create` above deliberately stays public to keep supporting guest
  // bookings.
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: Request & { user?: JwtUser }) {
    return this.PaystackBookingsService.findAll(req.user?._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':reference')
  async findOne(@Param('reference') reference: string) {
    return this.PaystackBookingsService.findByReference(reference);
  }

  @Post('send-confirmation')
  async sendConfirmation(
    @Body()
    body: {
      email: string;
      bookingReference: string;
    },
  ) {
    await this.PaystackBookingsService.sendConfirmationEmail(
      body.email,
      body.bookingReference,
    );

    return { message: 'Confirmation email sent' };
  }
}
