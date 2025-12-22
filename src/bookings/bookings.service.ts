import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bookings, BookingDocument } from './schemas/bookings.schema';
import { CreateBookingsDto } from './dto/create-bookings.dto';
import { BookingPayment } from './types/payment.type';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Bookings.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async create(dto: CreateBookingsDto): Promise<BookingDocument> {
    if (!dto.userId) {
      if (!dto.firstName || !dto.lastName || !dto.email || !dto.phoneNumber) {
        throw new BadRequestException(
          'Guest bookings require full name, email and phone number',
        );
      }
    }

    const booking = new this.bookingModel({
      ...dto,
      status: 'pending',
    });

    return booking.save();
  }

  async findAll(userId?: string): Promise<BookingDocument[]> {
    const filter = userId ? { userId } : {};
    return this.bookingModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }
    return booking;
  }

  async findByReference(bookingReference: string): Promise<BookingDocument> {
    const booking = await this.bookingModel
      .findOne({ bookingReference })
      .exec();

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    return booking;
  }

  /**
   * Safe payment update
   * - prevents duplicate payment within 5 minutes
   * - atomic DB update
   */
  async updatePayment(
    bookingReference: string,
    payment: BookingPayment,
  ): Promise<BookingDocument> {
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
    // Later: integrate Nodemailer / SendGrid
    console.log(
      `📧 Sending booking confirmation to ${email} for booking ${bookingReference}`,
    );
  }

}
