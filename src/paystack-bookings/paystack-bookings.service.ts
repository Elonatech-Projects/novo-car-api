// src/bookings/bookings.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaystackBookings,
  PaystackBookingsDocument,
} from './schema/paystack-bookings.schema';
// import { Bookings, PaystackBookingsDocument } from './schemas/bookings.schema';
// import { CreatePaystackBookingsDto } from './dto/create-bookings.dto';
import { BookingPayment } from './types/payment.type';
import { v4 as uuidv4 } from 'uuid';
import { CreatePaystackBookingsDto } from './dto/create-paystack-bookings.dto';

@Injectable()
export class PaystackBookingsService {
  constructor(
    @InjectModel(PaystackBookings.name)
    private readonly bookingModel: Model<PaystackBookingsDocument>,
  ) {}

  async create(
    dto: CreatePaystackBookingsDto,
  ): Promise<PaystackBookingsDocument> {
    // Guest validation
    if (!dto.userId) {
      if (!dto.firstName || !dto.lastName || !dto.email || !dto.phoneNumber) {
        throw new BadRequestException(
          'Guest bookings require full name, email and phone number',
        );
      }
    }

    // ✅ Generate booking reference safely
    const bookingReference = `BOOK-${uuidv4().split('-')[0].toUpperCase()}`;

    const booking = new this.bookingModel({
      ...dto,
      bookingReference,
      status: 'pending',
    });

    return booking.save();
  }

  async findAll(userId?: string): Promise<PaystackBookingsDocument[]> {
    return this.bookingModel
      .find(userId ? { userId } : {})
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByReference(
    bookingReference: string,
  ): Promise<PaystackBookingsDocument> {
    const booking = await this.bookingModel
      .findOne({ bookingReference })
      .exec();
    if (!booking) throw new BadRequestException('Booking not found');
    return booking;
  }

  async updatePayment(
    bookingReference: string,
    payment: BookingPayment,
  ): Promise<PaystackBookingsDocument> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const booking = await this.bookingModel.findOneAndUpdate(
      {
        bookingReference,
        $or: [
          { 'payment.verified': { $ne: true } },
          { updatedAt: { $lt: fiveMinutesAgo } },
        ],
      },
      {
        $set: {
          payment: {
            ...payment,
            verifiedAt: payment.verified ? new Date() : undefined,
          },
          status: payment.verified ? 'confirmed' : 'pending',
        },
      },
      { new: true },
    );

    if (!booking) {
      throw new BadRequestException(
        'Payment already processed or booking not found',
      );
    }

    return booking;
  }

  async sendConfirmationEmail(
    email: string,
    bookingReference: string,
  ): Promise<void> {
    console.log(
      `📧 Sending booking confirmation to ${email} for booking ${bookingReference}`,
    );
  }
}
