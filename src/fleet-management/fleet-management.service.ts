import { Injectable } from '@nestjs/common';
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

  async createFleetManagement(dto: CreateFleetManagementDto, user: string) {
    const { name, pickup, phone, destination, date, notes } = dto;

    if (!name || !pickup || !phone || !destination || !date || !notes) {
      throw new Error('All fields are to be filled');
    }

    const id = await this.userModel.findById(user);

    if (!id) {
      throw new Error('No user found');
    }

    const data = {
      name,
      phone,
      pickup,
      destination,
      date,
      notes,
      user: id._id,
    };

    const userFleetManagement = await this.fleetManagementModel.create(data);

    return {
      message: 'User booking fleet management created',
      success: true,
      userFleetManagement,
    };
  }
}
