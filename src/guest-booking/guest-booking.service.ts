import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';

// import { GuestBooking } from './schemas/guest-booking.schema';
import { CreateGuestBookingDto } from './dto/create-guest-booking.dto';
import { GuestBooking } from './schema/guest-booking.schema';

@Injectable()
export class GuestBookingService {
  constructor(
    @InjectModel(GuestBooking.name)
    private readonly guestBookingModel: Model<GuestBooking>,
  ) {}

  async createGuestBooking(dto: CreateGuestBookingDto) {
    const booking = new this.guestBookingModel({
      ...dto,
      status: 'pending',
    });

    await booking.save();

    return {
      message: 'Guest booking created successfully',
      booking,
    };
  }

  async initiateGuestPayment(bookingId: string) {
    const booking = await this.guestBookingModel.findById(bookingId);

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.status === 'paid') {
      throw new BadRequestException('Booking already paid');
    }

    const reference = `NOVO_${Date.now()}`;
    const amountInKobo = booking.price * 100;

    try {
      const response = await axios.post(
        `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: booking.email,
          amount: amountInKobo,
          reference,
          metadata: {
            bookingId: booking._id,
            fullName: booking.fullName,
            phone: booking.phone,
            route: `${booking.pickupLocation} → ${booking.dropoffLocation}`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      booking.reference = reference;
      await booking.save();

      return {
        authorizationUrl: response.data.data.authorization_url,
        reference,
      };
    } catch (error) {
      throw new BadRequestException(
        'Unable to initialize payment, please try again',
      );
    }
  }
}
