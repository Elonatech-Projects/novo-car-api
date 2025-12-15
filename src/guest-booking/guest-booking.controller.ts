import { Body, Controller, Post } from '@nestjs/common';
import { GuestBookingService } from './guest-booking.service';
import { CreateGuestBookingDto } from './dto/create-guest-booking.dto';

@Controller('guest-booking')
export class GuestBookingController {
  constructor(private readonly guestBookingService: GuestBookingService) {}

  @Post('create')
  async createGuestBooking(@Body() dto: CreateGuestBookingDto) {
    return this.guestBookingService.createGuestBooking(dto);
  }
}
