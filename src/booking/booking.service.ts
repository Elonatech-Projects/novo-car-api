import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schema/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Auth } from '../auth/schema/auth-schema';
// import { JwtUser } from '../auth/jwt.types';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
  ) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    for (const [key, value] of Object.entries(dto)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const bookingData = {
      ...dto,
      userId: user._id,
    };

    const userBooking = await this.bookingModel.create(bookingData);

    return {
      message: 'User booking created successfully',
      success: true,
      userBooking,
    };
  }

  async getAllBookings() {
    const findAllBookings = await this.bookingModel.find();

    if (!findAllBookings) {
      throw new BadRequestException('No request');
    }
    return {
      message: 'Document found',
      success: true,
      findAllBookings,
    };
  }
}
