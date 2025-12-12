import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../admin/schema/admin-schema';
import { AdminBooking } from './schema/adminbooking.schema';
import { CreateAdminBookingDto } from './dto/create-admin-booking.dto';
import { SearchBookingDto } from './dto/search-booking.dto';

@Injectable()
export class AdminBookingService {
  constructor(
    @InjectModel(AdminBooking.name)
    private readonly adminBookingModel: Model<AdminBooking>,

    @InjectModel(Admin.name)
    private readonly adminModel: Model<Admin>,
  ) {}

  // ADMIN CREATE BOOKING
  async createAdminBooking(adminId: string, dto: CreateAdminBookingDto) {
    const admin = await this.adminModel.findById(adminId);
    if (!admin) throw new BadRequestException('Invalid admin');

    const booking = await this.adminBookingModel.create({
      ...dto,
      admin: admin._id,
      adminEmail: admin.email, // attach email for reference
    });

    return {
      success: true,
      message: 'Admin booking created successfully',
      booking,
    };
  }

  // GET ALL ADMIN BOOKINGS
  async getAdminBookings() {
    const bookings = await this.adminBookingModel
      .find()
      .populate('admin', 'email') // optional populate
      .exec();

    return { success: true, bookings };
  }

  async getAllBooking(search: SearchBookingDto) {
    const { pickupLocation, pickupDate, dropoffLocation } = search;
    // const
    const query: Record<string, any> = {};
    if (pickupLocation)
      query.pickupLocation = { $regex: pickupLocation, $options: 'i' };
    if (dropoffLocation)
      query.dropoffLocation = { $regex: dropoffLocation, $options: 'i' };
    if (pickupDate) query.pickupDate = pickupDate;

    const bookings = await this.adminBookingModel.find(query).exec();

    return { success: true, bookings };
  }
}
