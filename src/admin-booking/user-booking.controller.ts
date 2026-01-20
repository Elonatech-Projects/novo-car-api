import { Controller, Post, Body } from '@nestjs/common';
import { AdminBookingService } from './admin-booking.service';
import { CreateUserBookingDto } from './dto/create-user-booking.dto';

@Controller('bookings')
export class UserBookingController {
  constructor(private readonly adminBookingService: AdminBookingService) {}

  @Post()
  async createBooking(@Body() dto: CreateUserBookingDto) {
    const booking = await this.adminBookingService.createUserBooking(
      dto.adminBookingId,
      dto.fullName,
      dto.email,
      dto.phone,
    );

    return {
      success: true,
      booking,
    };
  }
}
