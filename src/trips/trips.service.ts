// Trips service
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
import { getWeekDay } from '../common/utils/get-weekday.util';
import { UserBooking } from '../booking/schema/user-booking.schema';
import { SearchTripsDto } from './dto/search-trips.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>,
    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBooking>,
  ) {}

  // CREATE TRIP (Admin) - Keep this as is
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

  // SEARCH TRIPS (Public) - UPDATED VERSION
  // TripsService - searchTrips
  async searchTrips(query: SearchTripsDto) {
    const {
      pickupLocation,
      dropoffLocation,
      travelDate,
      shuttleType = 'all',
      passengers = 1,
    } = query;

    // 1️⃣ Validate required fields
    if (!pickupLocation || !dropoffLocation || !travelDate) {
      throw new BadRequestException(
        'pickupLocation, dropoffLocation, and travelDate are required'
      );
    }

    // 2️⃣ Validate travelDate
    const travel = new Date(travelDate);
    if (isNaN(travel.getTime())) {
      throw new BadRequestException(
        'Invalid travelDate format. Use YYYY-MM-DD',
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (travel < today) {
      throw new BadRequestException('Cannot search for past dates');
    }

    // 3️⃣ Determine weekday
    const weekday = getWeekDay(travelDate);

    // 4️⃣ Build MongoDB search query
    const searchQuery: any = {
      pickupLocation: { $regex: pickupLocation, $options: 'i' },
      dropoffLocation: { $regex: dropoffLocation, $options: 'i' },
      isAvailable: true,
      $or: [
        { operatingDays: { $in: [weekday] } },
        { specificDates: { $size: 0 } },
        { specificDates: { $in: [travelDate] } },
      ],
    };

    if (shuttleType !== 'all') {
      searchQuery.shuttleType = shuttleType;
    }

    // 5️⃣ Fetch trips
    const trips = await this.tripModel.find(searchQuery).lean();

    // 6️⃣ Compute availability
    const tripsWithAvailability = await Promise.all(
      trips.map(async (trip) => {
        const bookedSeatsAgg = await this.bookingModel.aggregate([
          {
            $match: {
              tripId: trip._id,
              travelDate,
              status: { $ne: 'CANCELLED' },
            },
          },
          { $group: { _id: null, total: { $sum: '$passengers' } } },
        ]);

        const bookedSeats = bookedSeatsAgg[0]?.total ?? 0;
        const availableSeats = trip.capacity - bookedSeats;

        return {
          ...trip,
          travelDate,
          availableSeats,
          isAvailable: availableSeats >= passengers,
          price: trip.basePrice, // frontend compatibility
        };
      }),
    );

    // 7️⃣ Filter only available trips
    const availableTrips = tripsWithAvailability.filter((t) => t.isAvailable);

    return {
      success: true,
      data: { trips: availableTrips, count: availableTrips.length },
    };
  }

  // GET TRIP BY ID
  async getTripById(id: string) {
    const trip = await this.tripModel.findById(id);
    if (!trip) throw new NotFoundException('Trip not found');
    return { success: true, trip };
  }

  // GET ALL TRIPS
  async getAllTrips() {
    const trips = await this.tripModel
      .find()
      .populate('createdBy', 'email name');
    return { success: true, trips };
  }

  // UPDATE TRIP
  async updateTrip(id: string, dto: UpdateTripDto) {
    const trip = await this.tripModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return { success: true, message: 'Trip updated successfully', trip };
  }

  // DEACTIVATE TRIP
  async deactivateTrip(id: string) {
    const trip = await this.tripModel.findByIdAndUpdate(
      id,
      { isAvailable: false },
      { new: true },
    );
    if (!trip) throw new NotFoundException('Trip not found');
    return { success: true, message: 'Trip deactivated successfully', trip };
  }

  // GET TRIPS BY ADMIN
  async getTripsByAdmin(adminId: string) {
    const trips = await this.tripModel.find({ createdBy: adminId });
    return { success: true, trips };
  }
}
