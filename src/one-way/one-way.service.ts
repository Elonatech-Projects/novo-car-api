import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Auth } from '../auth/schema/auth-schema';
import { Model } from 'mongoose';
import { One } from './schema/one-way-schema';
import { CreateOneWayDto } from './dto/create-one-way.dto';

@Injectable()
export class OneWayService {
  constructor(
    @InjectModel(Auth.name) private userModel: Model<Auth>,
    @InjectModel(One.name) private oneModel: Model<One>,
  ) {}

  async createOneWay(dto: CreateOneWayDto, userId: string) {
    const { from, to, departureDate } = dto;

    if (!from || !to || !departureDate) {
      throw new BadRequestException('All fields are required');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const data = {
      from,
      to,
      departureDate,
      user: user._id, // attach the ObjectId from the database
    };

    const userRound = await this.oneModel.create(data);

    return {
      message: 'User One Way created',
      success: true,
      userRound,
    };
  }
}
