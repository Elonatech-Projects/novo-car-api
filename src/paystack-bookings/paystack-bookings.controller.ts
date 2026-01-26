import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { PaystackBookingsService } from './paystack-bookings.service';
// import { JwtUser } from '../admin/jwt.admin.types';
import { JwtUser } from '../auth/jwt.types';
import { CreatePaystackBookingsDto } from './dto/create-paystack-bookings.dto';

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

  @Get()
  async findAll(@Req() req: Request & { user?: JwtUser }) {
    return this.PaystackBookingsService.findAll(req.user?._id);
  }

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
