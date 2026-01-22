import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserBooking } from '../admin-booking/schema/user-booking.schema';
import { PaystackService } from './paystack.service';
import { AnotherBooking } from '../admin-booking/schema/another-booking.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(UserBooking.name)
    private readonly userBookingModel: Model<UserBooking>,

    @InjectModel(AnotherBooking.name)
    private readonly anotherBookingModel: Model<AnotherBooking>,

    private readonly paystackService: PaystackService,
  ) {}

  //   Payment Initialization
  async initializePayment(bookingId: string) {
    // Find booking
    const booking = await this.userBookingModel.findById(bookingId);
    if (!booking) throw new BadRequestException('Booking not found');

    if (!booking.email)
      throw new BadRequestException('Email not found for this booking');

    if (booking.status === 'PAID') {
      throw new BadRequestException('Booking already paid');
    }

    // 2️⃣ Generate reference
    const reference = `BOOKING_${Date.now()}`;

    // 3️⃣ Call Paystack
    const paystackResponse = await this.paystackService.initializeTransaction({
      email: booking.email,
      amount: Number(booking.price) * 100, // kobo
      reference,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    // if (!booking.email) {
    //   throw new BadRequestException('Email not found for this booking');
    // }

    // 4️⃣ Save reference
    booking.paymentReference = reference;
    await booking.save();

    return {
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
    };

    console.log(booking);
  }

  //   Initalize Another Payment
  async initializeAnotherPayment(bookingId: string) {
    // Find booking
    const booking = await this.anotherBookingModel.findById(bookingId);
    if (!booking) throw new BadRequestException('Booking not found');

    if (!booking.email)
      throw new BadRequestException('Email not found for this booking');

    if (booking.status === 'PAID') {
      throw new BadRequestException('Booking already paid');
    }

    // 2️⃣ Generate reference
    const reference = `BOOKING_${Date.now()}`;

    // 3️⃣ Call Paystack
    const paystackResponse = await this.paystackService.initializeTransaction({
      email: booking.email,
      amount: Number(booking.price) * 100, // kobo
      reference,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    // if (!booking.email) {
    //   throw new BadRequestException('Email not found for this booking');
    // }

    // 4️⃣ Save reference
    booking.paymentReference = reference;
    await booking.save();

    return {
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
    };

    console.log(booking);
  }

  async verifyPayment(reference: string) {
    const paystackData =
      await this.paystackService.verifyTransaction(reference);

    if (!paystackData || paystackData.data.status !== 'success') {
      throw new BadRequestException('Payment was not successful');
    }

    const bookingId = paystackData.data.metadata?.bookingId;
    if (!bookingId) throw new BadRequestException('Booking Reference invalid');

    let booking = await this.anotherBookingModel.findById(bookingId);

    if (!booking) {
      booking = await this.userBookingModel.findById(bookingId);
    }

    if (!booking) throw new BadRequestException('Booking not found');

    // Update Booking as Paid
    booking.status = 'PAID';
    booking.paidAt = new Date();
    await booking.save();

    return {
      success: true,
      bookingType:
        booking instanceof this.userBookingModel ? 'UserBooking' : 'AnotherBooking',
      bookingId: booking._id,
      status: booking.status,
      paidAt: booking.paidAt,
    };
  }
}
