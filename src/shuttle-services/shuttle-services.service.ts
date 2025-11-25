
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

  async createShuttle(dto: CreateShuttleServicesDto, user: string) {
  const { name, phone, pickup, destination, date } = dto;

  if (!name || !phone || !pickup || !destination || !date) {
    throw new BadRequestException('All fields are to be filled');
  }

  const id = await this.userModel.findById(user);

  if (!id) {
    throw new BadRequestException('No user found');
  }

  const data = {
    name,
    phone,
    pickup,
    destination,
    date,
    user: id._id,
  };

  const userShuttle = await this.shuttleModel.create(data);

  return {
    message: 'User booking shuttle created',
    success: true,
    userShuttle,
  };
}

}