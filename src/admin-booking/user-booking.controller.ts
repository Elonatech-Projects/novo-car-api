import { Controller, Post, Body } from '@nestjs/common';
import { AdminBookingService } from './admin-booking.service';
import { CreateUserBookingDto } from './dto/create-user-booking.dto';

@Controller('bookings')
export class UserBookingController {
  constructor(private readonly adminBookingService: AdminBookingService) {}

  @Post()
  async createBooking(@Body() dto: CreateUserBookingDto) {
    // 1️⃣ Find the trip
    const trip = await this.adminBookingService.adminBookingModel.findById(dto.adminBookingId);
    if (!trip) throw new Error('Trip not found');

    // 2️⃣ Create booking for user (pending payment)
    const booking = await this.adminBookingService.adminBookingModel.create({
      trip: trip._id,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      status: 'PENDING_PAYMENT',
      price: trip.price,
    });

    return {
      success: true,
      booking,
    };
  }
}
