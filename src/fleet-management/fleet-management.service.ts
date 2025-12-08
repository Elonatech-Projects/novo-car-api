import { BadRequestException, Injectable } from '@nestjs/common';
import { FleetManagement } from './schema/fleet-management-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from '../auth/schema/auth-schema';
import { CreateFleetManagementDto } from './dto/create-fleet-management.dto';

@Injectable()
export class FleetManagementService {
  constructor(
    @InjectModel(FleetManagement.name)
    private fleetManagementModel: Model<FleetManagement>,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
  ) {}

  async createFleetManagement(dto: CreateFleetManagementDto, userId: string) {
    const { name, pickup, phone, destination, date, notes } = dto;

    for (const [key, value] of Object.entries(dto)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const fleetData = {
      name,
      phone,
      pickup,
      destination,
      date,
      notes,
      user: user._id,
    };

    const createdFleet = await this.fleetManagementModel.create(fleetData);

    return {
      message: 'Fleet management booking created successfully',
      success: true,
      createdFleet,
    };
  }
}
