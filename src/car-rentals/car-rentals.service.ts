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
    // Destructure all fields including optional
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

    // Check required fields only
    const requiredFields = {
      bookingCategory,
      bookingModel,
      name,
      email,
      phoneNumber,
      pickupDate,
      dropoffDate,
      notes,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }

    // Validate dates
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore time

    if (pickup < today) {
      throw new BadRequestException('Pickup date cannot be in the past.');
    }

    if (dropoff <= pickup) {
      throw new BadRequestException('Dropoff must be after pickup date.');
    }

    // Find user
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Build rental object
    const carRentalData = {
      bookingCategory,
      bookingModel,
      name,
      email,
      phoneNumber,
      pickupDate: pickup,
      dropoffDate: dropoff,
      notes,
      subModel: subModel || null, // optional
      userId: user._id,
    };

    // Save to DB
    const createdCarRental = await this.carRentalModel.create(carRentalData);

    return {
      message: 'Car rental created successfully',
      success: true,
      createdCarRental,
    };
  }
}
