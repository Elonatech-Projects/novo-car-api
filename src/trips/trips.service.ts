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
  async searchTrips(query: any) {
    // Debug logging
    console.log('🔍 Search query received:', query);
    console.log('🔍 Query parameters:', {
      pickupLocation: query.pickupLocation,
      dropoffLocation: query.dropoffLocation,
      travelDate: query.travelDate,
      shuttleType: query.shuttleType,
      passengers: query.passengers,
    });

    // Extract and validate required fields
    const pickupLocation = query.pickupLocation;
    const dropoffLocation = query.dropoffLocation;
    const travelDate = query.travelDate;
    const shuttleType = query.shuttleType || 'all';
    const passengers = parseInt(query.passengers) || 1;

    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !travelDate) {
      throw new BadRequestException(
        'pickupLocation, dropoffLocation, and travelDate are required',
      );
    }

    // Validate travelDate
    const date = new Date(travelDate);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        'Invalid travelDate format. Use YYYY-MM-DD',
      );
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      throw new BadRequestException('Cannot search for past dates');
    }

    // Get weekday from travelDate
    const weekday = getWeekDay(travelDate);

    // Build MongoDB query - FIXED: Changed variable name from 'query' to 'searchQuery'
    const searchQuery: any = {
      pickupLocation: { $regex: pickupLocation, $options: 'i' },
      dropoffLocation: { $regex: dropoffLocation, $options: 'i' },
      isAvailable: true,
      $or: [
        { operatingDays: { $in: [weekday] } },
        { specificDates: { $in: [travelDate] } },
      ],
    };

    // Add shuttleType filter if specified
    if (shuttleType && shuttleType !== 'all') {
      searchQuery.shuttleType = shuttleType;
    }

    console.log('🔍 MongoDB searchQuery:', searchQuery);

    // Find trips
    const trips = await this.tripModel.find(searchQuery).lean();

    console.log(`🔍 Found ${trips.length} trips matching criteria`);

    // Calculate availability for each trip
    const tripsWithAvailability = await Promise.all(
      trips.map(async (trip) => {
        // Count booked seats for this trip on the specific date
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

        const bookedCount = bookedSeats[0]?.total || 0;
        const availableSeats = trip.capacity - bookedCount;
        const isAvailable = availableSeats >= passengers;

        return {
          ...trip,
          availableSeats,
          isAvailable,
          travelDate,
          price: trip.basePrice, // Add price alias for frontend compatibility
        };
      }),
    );

    // Filter to only available trips
    const availableTrips = tripsWithAvailability.filter((t) => t.isAvailable);

    console.log(`✅ ${availableTrips.length} trips available for booking`);

    return {
      success: true,
      data: {
        trips: availableTrips,
        count: availableTrips.length,
      },
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
