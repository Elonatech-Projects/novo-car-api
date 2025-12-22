import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserBooking } from './schema/userbooking.schema';
// import { CreateAdminBookingDto } from '../admin-booking/dto/create-admin-booking.dto';

import { Auth } from '../auth/schema/auth-schema';
// import { SearchBookingDto } from './dto/search-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
// import { Admin } from '../admin/schema/admin-schema';
// import { createAdminBooking } from '../admin-booking/schema/adminbooking.schema';
// import { JwtUser } from '../auth/jwt.types';

@Injectable()
export class UserBookingService {
  constructor(
    @InjectModel(UserBooking.name) private bookingModel: Model<UserBooking>,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
    // @InjectModel(createAdminBooking.name) private AdminModel: Model<Admin>,
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

  // async searchBookings (fields: SearchBookingDto) {
  //   const { pickupLocation, dropoffLocation, }
  // }
}
