import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../admin/schema/admin-schema';
import { AdminBooking } from './schema/adminbooking.schema';
import { CreateAdminBookingDto } from './dto/create-admin-booking.dto';
import { SearchBookingDto } from './dto/search-booking.dto';
import { getWeekDay } from '../common/utils/get-weekday.util';
// import { PaystackService } from '../payments/paystack.service';
import { PaystackService } from '../payments/paystack.service';

@Injectable()
export class AdminBookingService {
  constructor(
    @InjectModel(AdminBooking.name)
    private readonly adminBookingModel: Model<AdminBooking>,

    @InjectModel(Admin.name)
    private readonly adminModel: Model<Admin>,

    // @InjectModel(PaystackService)
    private readonly paystackService: PaystackService,
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
    if (pickupDate) {
      const day = getWeekDay(pickupDate);
      query.availableDays = day;
      // query.pickupDate = pickupDate;
    }

    const bookings = await this.adminBookingModel.find(query).exec();

    if (!bookings.length) {
      return {
        success: true,
        message: 'No trips available for selected date',
        bookings: [],
      };
    }

    return { success: true, bookings };
  }

  // Initialize Booking
  async initiateBooking(adminId: string, dto: CreateAdminBookingDto) {
    const admin = await this.adminModel.findById(adminId);
    if (!admin) throw new BadRequestException('Invalid admin');

    const booking = await this.adminBookingModel.create({
      ...dto,
      admin: admin._id,
      adminEmail: admin.email,
      status: 'PENDING_PAYMENT', // important
    });

    return {
      success: true,
      message: 'Booking initiated, awaiting payment',
      booking,
    };
  }

  // Payment Verification and Booking Confirmation
  // admin-booking.service.ts
  // async payForBooking(bookingId: string, callbackUrl: string) {
  //   const booking = await this.adminBookingModel.findById(bookingId);
  //   if (!booking) throw new BadRequestException('Booking not found');

  //   // generate unique reference
  //   const reference = `BKNG_${Date.now()}`;

  //   const paystackData = await this.paystackService.initializeTransaction(
  //     booking.adminEmail,
  //     Number(booking.price) * 100, // kobo
  //     reference,
  //     callbackUrl,
  //   );

  //   // Save reference in booking
  //   booking.paymentRef = reference;
  //   await booking.save();

  //   return paystackData; // contains authorization_url
  // }

  // admin-booking.service.ts
  async updateBookingPaymentStatus(
    reference: string,
    status: 'PAID' | 'FAILED',
  ) {
    const booking = await this.adminBookingModel.findOne({
      paymentRef: reference,
    });
    if (!booking) throw new BadRequestException('Booking not found');

    booking.status = status;
    if (status === 'PAID') booking.paidAt = new Date();

    await booking.save();
    return booking;
  }

  async markAsPendingPayment(bookingId: string, reference: string) {
    return this.adminBookingModel.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'pending',
        paymentReference: reference,
      },
      { new: true },
    );
  }

  async createUserBooking(
    adminBookingId: string,
    fullName: string,
    email: string,
    phone: string,
  ) {
    // 1️⃣ Find the trip
    const trip = await this.adminBookingModel.findById(adminBookingId);
    if (!trip) throw new BadRequestException('Trip not found');

    // 2️⃣ Create the user booking
    const booking = await this.adminBookingModel.create({
      trip: trip._id,
      fullName,
      email,
      phone,
      status: 'PENDING_PAYMENT',
      price: trip.price,
    });

    return booking;
  }
}
