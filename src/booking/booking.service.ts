import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking } from './schema/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Auth } from '../auth/schema/auth-schema';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
  ) { }

 async createBooking(userId: string, dto: CreateBookingDto) {
  const { pickupDate, pickupLocation, pickupTime, shuttleType, passengers } = dto;

  const data = {
    pickupDate,
    pickupLocation,
    pickupTime,
    shuttleType,
    passengers,
  };

  for (const [key, value] of Object.entries(data)) {
    if (!value) {
      throw new BadRequestException(`${key} is required`);
    }
  }

  const user = await this.userModel.findById(userId);

  if (!user) {
    throw new BadRequestException(`User not found`);
  }

  const userBooking = {
    data,
    user: user._id,
  };

  const userData = await this.bookingModel.create(userBooking);

  return {
    message: 'User booking created',
    userData,
  };
}

}
