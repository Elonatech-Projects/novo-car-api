import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { GuestBooking } from './schemas/guest-booking.schema';
import { GuestBooking } from './schema/guest-booking.schema';
import { CreateGuestBookingDto } from './dto/create-guest-booking.dto';

@Injectable()
export class GuestBookingService {
  constructor(
    @InjectModel(GuestBooking.name)
    private readonly guestBookingModel: Model<GuestBooking>,
  ) {}

  async createGuestBooking(dto: CreateGuestBookingDto) {
    const booking = new this.guestBookingModel({
      ...dto,
      status: 'pending',
    });

    await booking.save();

    return {
      message: 'Guest booking created successfully',
      booking,
    };
  }
}
