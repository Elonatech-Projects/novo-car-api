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
import { getSurgeMultiplier } from '../pricing/surge/surge.util';

@Injectable()
export class ShuttleBookingService {
  constructor(
    @InjectModel(ShuttleBooking.name)
    private readonly bookingModel: Model<ShuttleBookingDocument>,
    private readonly pricingService: PricingService,
    private readonly mapsService: MapsService,
  ) {}

  async create(dto: CreateShuttleBookingDto, userId?: string) {
    // Added Surge Multiplier
    const pickupDateTime = new Date(`${dto.bookingDate}T${dto.pickupTime}`);

    const surgeMultiplier = getSurgeMultiplier(pickupDateTime);
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
      surgeMultiplier, //Added Surge Multiplier here
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
      status: BookingStatus.PENDING_PAYMENT,
      statusHistory: [
        {
          status: BookingStatus.PENDING_PAYMENT,
          changedAt: new Date(),
        },
      ],
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
    page?: number;
    limit?: number;
  }) {
    const { status, shuttleType, page = 1, limit = 20 } = filters;

    const query: Record<string, unknown> = {};

    if (status) query.status = status;
    if (shuttleType) query.shuttleType = shuttleType;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.bookingModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.bookingModel.countDocuments(query),
    ]);

    return {
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
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

  // Update Status
  async updateStatus(id: string, status: BookingStatus) {
    const booking = await this.bookingModel.findById(id);

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (!this.isValidStatusTransition(booking.status, status)) {
      throw new BadRequestException(
        `Invalid status transition from ${booking.status} to ${status}`,
      );
    }

    await this.changeStatus(booking, status);

    return {
      success: true,
      data: booking,
    };
  }

  private async changeStatus(
    booking: ShuttleBookingDocument,
    newStatus: BookingStatus,
  ) {
    if (booking.status === newStatus) {
      return; // prevent duplicate pushes
    }

    booking.status = newStatus;

    booking.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
    });

    await booking.save();
  }

  private isValidStatusTransition(
    current: BookingStatus,
    next: BookingStatus,
  ): boolean {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING_PAYMENT]: [
        BookingStatus.PAID,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.PAID]: [
        BookingStatus.CONFIRMED,
        BookingStatus.REFUND_REQUESTED,
      ],
      [BookingStatus.CONFIRMED]: [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.REFUND_REQUESTED]: [BookingStatus.REFUND_PENDING],
      [BookingStatus.REFUND_PENDING]: [BookingStatus.REFUNDED],
      [BookingStatus.REFUNDED]: [],
    };

    return validTransitions[current]?.includes(next) ?? false;
  }
}
