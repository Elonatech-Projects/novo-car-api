import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ShuttleBooking,
  ShuttleBookingDocument,
} from './schema/shuttle-booking.schema';
import { CreateShuttleBookingDto } from './dto/create-shuttle-booking.dto';
import { ShuttleType } from './enums';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { PricingService } from '../pricing/pricing.service';
import { MapsService } from '../maps/maps.service';

@Injectable()
export class ShuttleBookingService {
  constructor(
    @InjectModel(ShuttleBooking.name)
    private readonly bookingModel: Model<ShuttleBookingDocument>,
    private readonly pricingService: PricingService,
    private readonly mapsService: MapsService,
  ) {}

  async create(dto: CreateShuttleBookingDto, userId?: string) {
    // 1️⃣ Validate fields
    this.validateByType(dto);

    // 2️⃣ Resolve distance (BACKEND)
    const distanceKm = await this.mapsService.getDistanceKm(
      dto.pickupLocation,
      dto.dropoffLocation,
    );

    // 3️⃣ Calculate price (AUTHORITATIVE)
    const pricing = await this.pricingService.estimate({
      shuttleType: dto.shuttleType,
      passengers: dto.numberOfPassengers,
      numberOfCars: dto.numberOfCars,
      distanceKm,
    });

    // 4️⃣ Generate reference
    const bookingReference = `NOVO-${Date.now().toString().slice(-8)}`;

    // 5️⃣ Persist booking with LOCKED price
    const booking = await this.bookingModel.create({
      ...dto,
      userId,
      bookingReference,
      distanceKm,
      pricingBreakdown: pricing,
      totalPrice: pricing.total,
      status: BookingStatus.PENDING,
    });

    return {
      success: true,
      data: booking,
    };
  }

  private validateByType(dto: CreateShuttleBookingDto) {
    switch (dto.shuttleType) {
      case ShuttleType.AIRPORT:
        if (!dto.airport) {
          throw new BadRequestException('Airport is required');
        }
        break;

      case ShuttleType.WEDDING:
        if (!dto.weddingVenue || !dto.weddingDate) {
          throw new BadRequestException('Wedding venue and date are required');
        }
        break;

      case ShuttleType.TOUR:
        if (!dto.tourPackage || !dto.tourDuration) {
          throw new BadRequestException(
            'Tour package and duration are required',
          );
        }
        break;
    }
  }

  /**
   * List all bookings (admin use-case)
   */
  async listAll(filters: {
    status?: BookingStatus;
    shuttleType?: ShuttleType;
  }) {
    const query: Record<string, any> = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.shuttleType) {
      query.shuttleType = filters.shuttleType;
    }

    const bookings = await this.bookingModel
      .find(query)
      .sort({ createdAt: -1 });

    return {
      success: true,
      count: bookings.length,
      data: bookings,
    };
  }

  /**
   * Get a single booking by ID
   */
  async getById(id: string) {
    const booking = await this.bookingModel.findById(id);

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    return {
      success: true,
      data: booking,
    };
  }

  /**
   * List bookings for a specific user
   */
  async listByUser(userId?: string) {
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const bookings = await this.bookingModel
      .find({ userId })
      .sort({ createdAt: -1 });

    return {
      success: true,
      count: bookings.length,
      data: bookings,
    };
  }

  async updateStatus(id: string, status: BookingStatus) {
    const booking = await this.bookingModel.findById(id);

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    booking.status = status;
    await booking.save();

    return {
      success: true,
      data: booking,
    };
  }
}
