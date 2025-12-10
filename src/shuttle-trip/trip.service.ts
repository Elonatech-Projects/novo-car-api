import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './schema/trip.schema';
import { CreateTripDto } from './dto/create-trip.dto';
import { SearchTripDto } from './dto/search-trip.dto';
import { Admin } from '../admin/schema/admin-schema';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
  ) {}

  // Admin: create a trip
  async createTrip(dto: CreateTripDto, adminId: string) {
    const { from, to, departureDate, returnDate, tripType } = dto;

    if (!from || !to || !departureDate || !tripType) {
      throw new BadRequestException('Required trip fields are missing');
    }

    if (tripType === 'round-trip' && !returnDate) {
      throw new BadRequestException('Return date is required for round-trip');
    }

    const admin = await this.adminModel.findById(adminId);
    if (!admin) {
      throw new BadRequestException('Only admins can create trips');
    }

    const trip = await this.tripModel.create({
      ...dto,
      createdBy: admin._id,
    });

    return {
      message: 'Trip document created successfully',
      success: true,
      trip,
    };
  }

  // User: search for trips
  async searchTrips(dto: SearchTripDto): Promise<Trip[]> {
    const query: any = {
      from: dto.from,
      to: dto.to,
      tripType: dto.tripType,
      departureDate: dto.departureDate,
    };

    if (dto.tripType === 'round-trip' && dto.returnDate) {
      query.returnDate = dto.returnDate;
    }

    const trips = await this.tripModel.find(query).exec();
    if (!trips.length) {
      throw new NotFoundException('No trips found for your search');
    }
    return trips;
  }

  // Optional: get all trips (Admin)
  async getAllTrips(): Promise<Trip[]> {
    return this.tripModel.find().exec();
  }
}
