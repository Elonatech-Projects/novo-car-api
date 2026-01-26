import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserBooking, UserBookingDocument } from './schema/user-booking.schema';
import { CreateUserBookingDto } from './dto/create-user-booking.dto';
import { Trip, TripDocument } from '../trips/schema/trip.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBookingDocument>,
    @InjectModel(Trip.name)
    private readonly tripModel: Model<TripDocument>,
  ) {}

  // CREATE USER BOOKING
  async createUserBooking(dto: CreateUserBookingDto, userId?: string) {
    // 1️⃣ Check if trip exists and active
    const trip = await this.tripModel.findById(dto.tripId);
    if (!trip || !trip.isAvailable) {
      throw new BadRequestException('Trip not available');
    }

    // 2️⃣ Check available seats
    const bookings = await this.bookingModel.aggregate([
      {
        $match: {
          tripId: trip._id,
          travelDate: dto.travelDate,
          status: { $ne: 'CANCELLED' },
        },
      },
      { $group: { _id: null, total: { $sum: '$passengers' } } },
    ]);
    const bookedSeats = bookings[0]?.total ?? 0;
    const availableSeats = trip.capacity - bookedSeats;

    if (dto.passengers > availableSeats) {
      throw new BadRequestException(
        `Not enough seats. Only ${availableSeats} left`,
      );
    }

    // 3️⃣ Calculate total price
    const totalPrice = trip.basePrice * dto.passengers;

    // 4️⃣ Create booking
    const booking = await this.bookingModel.create({
      tripId: trip._id,
      userId,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passengers: dto.passengers,
      travelDate: dto.travelDate,
      price: totalPrice,
    });

    return { success: true, booking };
  }

  // GET BOOKING BY ID
  async getBookingById(id: string) {
    const booking = await this.bookingModel.findById(id).populate('tripId');
    if (!booking) throw new NotFoundException('Booking not found');
    return { success: true, booking };
  }
}
