import {
  //   BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminBooking } from './schema/adminbooking.schema';
import { UserBooking } from './schema/user-booking.schema';
import { SearchBookingDto } from './dto/search-booking.dto';
import { CreateUserBookingDto } from './dto/create-user-booking.dto';
import { anotherUserBookingDto } from './dto/another-user-booking.dto';
import { AnotherBooking } from './schema/another-booking.schema';

@Injectable()
export class UserBookingService {
  constructor(
    @InjectModel(AdminBooking.name)
    private readonly adminBookingModel: Model<AdminBooking>,

    @InjectModel(UserBooking.name)
    private readonly userBookingModel: Model<UserBooking>,

    @InjectModel(AnotherBooking.name)
    private readonly anotherBookingModel: Model<AnotherBooking>,
  ) {}

  //   Create User Booking
  async createUserBooking(dto: CreateUserBookingDto) {
    const trip = await this.adminBookingModel.findById(dto.adminBookingId);
    if (!trip) throw new NotFoundException('Trip not found');

    const booking = await this.userBookingModel.create({
      tripId: trip._id,
      userId: dto.userId,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passengers: dto.passengers,
      shuttleType: trip.shuttleType,
      pickupTime: dto.pickupTime,
      pickupDate: trip.pickupDate,
      dropoffLocation: trip.dropoffLocation,
      pickupLocation: trip.pickupLocation,
      price: trip.price,
      status: 'PENDING_PAYMENT',
    });

    return booking;
  }

  //  Another User Booking
  async anotherUserBooking(dto: anotherUserBookingDto) {
    const trip = await this.adminBookingModel.findById(dto.adminBookingId);
    if (!trip) throw new NotFoundException('Trip not found');

    const booking = await this.anotherBookingModel.create({
      tripId: trip._id,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      price: Number(trip.price),
      status: 'PENDING_PAYMENT',
    });

    return booking;
  }

  //   Search for Trips
  async searchTrips(search: SearchBookingDto) {
    const { pickupLocation, dropoffLocation, pickupDate } = search;

    const query: Record<string, any> = {};

    if (pickupLocation)
      query.pickupLocation = { $regex: pickupLocation, $options: 'i' };

    if (dropoffLocation)
      query.dropoffLocation = { $regex: dropoffLocation, $options: 'i' };

    if (pickupDate) query.pickupDate = new Date(pickupDate);

    const trips = await this.adminBookingModel.find(query).exec();

    return trips.length
      ? { success: true, trips }
      : { success: true, trips: [], message: 'No trips available' };
  }
}
