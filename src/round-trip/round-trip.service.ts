import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Auth } from '../auth/schema/auth-schema';
import { Model } from 'mongoose';
import { CreateRoundTripDto } from './dto/create-round-trip.dto';
import { Round } from './schema/round-trip-schema';

@Injectable()
export class RoundTripService {
  constructor(
    @InjectModel(Auth.name) private userModel: Model<Auth>,
    @InjectModel(Round.name) private roundModel: Model<Round>,
  ) {}

  async createRoundTrip(dto: CreateRoundTripDto, userId: string) {
    const { from, to, returnDate, departureDate } = dto;

    if (!from || !to || !returnDate || !departureDate) {
      throw new BadRequestException('All fields are required');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const data = {
      from,
      to,
      returnDate,
      departureDate,
      user: user._id, // attach the ObjectId from the database
    };

    const userRound = await this.roundModel.create(data);

    return {
      message: 'User Round Trip created',
      success: true,
      userRound,
    };
  }
}
