import { BadRequestException, Injectable } from '@nestjs/common';
import { Shuttle } from './schema/shuttle-service-schema';
import { Model } from 'mongoose';
import { CreateShuttleServicesDto } from './dto/create-shuttle-services.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Auth } from '../auth/schema/auth-schema';

@Injectable()
export class ShuttleServicesService {
  constructor(
    @InjectModel(Shuttle.name) private shuttleModel: Model<Shuttle>,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
  ) {}

  async createShuttle(dto: CreateShuttleServicesDto, userId: string) {
    const { name, phone, pickup, destination, date } = dto;

    // Validate required fields
    for (const [key, value] of Object.entries(dto)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }

    // Fetch the user from Auth model
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const shuttleData = {
      name,
      phone,
      pickup,
      destination,
      date,
      user: user._id, // attach ObjectId
    };

    const createdShuttle = await this.shuttleModel.create(shuttleData);

    return {
      message: 'User shuttle booking created successfully',
      success: true,
      createdShuttle,
    };
  }
}
