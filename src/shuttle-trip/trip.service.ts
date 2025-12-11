import {
  BadRequestException,
  Injectable,
  // NotFoundException,
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

    if (!from || !to || !departureDate) {
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
  async searchTrips(fields: SearchTripDto) {
    const { from, to, departureDate, returnDate, tripType } = fields;

    const filter: Record<string, any> = {};

    if (from) {
      filter.from = { $regex: from, $options: 'i' };
    }

    if (to) {
      filter.to = { $regex: to, $options: 'i' };
    }

    if (departureDate) {
      filter.departureDate = { $regex: departureDate, $options: 'i' };
    }

    if (returnDate) {
      filter.returnDate = { $regex: returnDate, $options: 'i' };
    }

    if (tripType) {
      filter.tripType = { $regex: tripType, $options: 'i' };
    }

    const tripSearch = await this.tripModel.find(filter);

    if (!tripSearch) {
      throw new BadRequestException('No trip search found in database');
    }

    return {
      message: 'Search field trip found',
      success: true,
      tripSearch,
    };
  }

  // Optional: get all trips (Admin)
  // async getAllTrips(): Promise<Trip[]> {
  //   return this.tripModel.find().exec();
}
