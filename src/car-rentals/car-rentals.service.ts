import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserCarForm } from './schema/car-rentals.schema';
import { Model } from 'mongoose';
import { Auth } from '../auth/schema/auth-schema';
import { CarRentalsDto } from './dto/car-rentals.dto';

@Injectable()
export class CarRentalsService {
  constructor(
    @InjectModel(UserCarForm.name)
    private carRentalModel: Model<UserCarForm>,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
  ) {}

  async createCarRentals(dto: CarRentalsDto, userId: string) {
    const {
      bookingCategory,
      bookingModel,
      name,
      email,
      phoneNumber,
      pickupDate,
      dropoffDate,
      notes,
      subModel,
    } = dto;

    for (const [key, value] of Object.entries(dto)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const carRentalData = {
      bookingCategory,
      bookingModel,
      name,
      email,
      phoneNumber,
      pickupDate,
      dropoffDate,
      notes,
      subModel,
      userId: user._id, // match schema
    };

    const createdCarRental = await this.carRentalModel.create(carRentalData);

    return {
      message: 'Car Rentals created successfully',
      success: true,
      createdCarRental,
    };
  }
}
