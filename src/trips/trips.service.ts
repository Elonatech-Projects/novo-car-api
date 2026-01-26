import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './schema/trip.schema';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { SearchTripsDto } from './dto/search-trips.dto';
import { getWeekDay } from '../common/utils/get-weekday.util';
import { UserBooking } from '../booking/schema/user-booking.schema';

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>,
    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBooking>,
  ) {}

  // CREATE TRIP (Admin)
  async createTrip(adminId: string, createTripDto: CreateTripDto) {
    const existing = await this.tripModel.findOne({
      routeCode: createTripDto.routeCode,
    });
    if (existing) throw new BadRequestException('Route code already exists');

    const trip = await this.tripModel.create({
      ...createTripDto,
      createdBy: adminId,
      isAvailable: createTripDto.isActive ?? true,
    });

    return { success: true, message: 'Trip created successfully', trip };
  }

  // SEARCH TRIPS (Public)
  async searchTrips(dto: SearchTripsDto) {
    const {
      pickupLocation,
      dropoffLocation,
      travelDate,
      shuttleType,
      passengers = 1,
    } = dto;

    const date = new Date(travelDate);
    if (isNaN(date.getTime()))
      throw new BadRequestException('Invalid travelDate');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today)
      throw new BadRequestException('Cannot search for past dates');

    const weekday = getWeekDay(travelDate);

    const query: any = {
      pickupLocation: { $regex: pickupLocation, $options: 'i' },
      dropoffLocation: { $regex: dropoffLocation, $options: 'i' },
      isAvailable: true,
      $or: [
        {
          operatingDays: { $in: [weekday] },
        },
        { specificDates: { $in: [travelDate] } },
      ],
    };

    if (shuttleType && shuttleType !== 'all') query.shuttleType = shuttleType;

    const trips = await this.tripModel.find(query).lean();

    const tripsWithAvailability = await Promise.all(
      trips.map(async (trip) => {
        const bookedSeats = await this.bookingModel.aggregate([
          {
            $match: {
              tripId: trip._id,
              travelDate,
              status: { $ne: 'CANCELLED' },
            },
          },
          { $group: { _id: null, total: { $sum: '$passengers' } } },
        ]);
        const availableSeats = trip.capacity - (bookedSeats[0]?.total ?? 0);
        return {
          ...trip,
          availableSeats,
          isAvailable: availableSeats >= Number(passengers),
          travelDate,
        };
      }),
    );

    return {
      success: true,
      count: tripsWithAvailability.filter((t) => t.isAvailable).length,
      trips: tripsWithAvailability.filter((t) => t.isAvailable),
    };
  }

  async getTripById(id: string) {
    const trip = await this.tripModel.findById(id);
    if (!trip) throw new NotFoundException('Trip not found');
    return { success: true, trip };
  }

  async getAllTrips() {
    const trips = await this.tripModel
      .find()
      .populate('createdBy', 'email name');
    return { success: true, trips };
  }

  async updateTrip(id: string, dto: UpdateTripDto) {
    const trip = await this.tripModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return { success: true, message: 'Trip updated successfully', trip };
  }

  async deactivateTrip(id: string) {
    const trip = await this.tripModel.findByIdAndUpdate(
      id,
      { isAvailable: false },
      { new: true },
    );
    if (!trip) throw new NotFoundException('Trip not found');
    return { success: true, message: 'Trip deactivated successfully', trip };
  }

  async getTripsByAdmin(adminId: string) {
    const trips = await this.tripModel.find({ createdBy: adminId });
    return { success: true, trips };
  }
}
