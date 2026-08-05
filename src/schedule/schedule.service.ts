// Schedule Service
// src/schedule/schedule.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule, ScheduleDocument } from './schema/schedule.schema';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { getWeekDay } from '../common/utils/get-weekday.util';
import { City, CityDocument } from '../city/schema/city.schema';
import {
  SchedulePlanInput,
  UpdateSchedulePayload,
} from './types/UpdateSchedulePayload';
import {
  Shuttle,
  ShuttleDocument,
} from '../shuttle-services/schema/shuttle-service.schema';
import { ShuttleBookingStatus } from '../common/enums/shuttle-booking.enum';
// import { CityDocument } from '../city/schema/city.schema';

// A Schedule with a live seatsAvailable figure attached for a specific date.
// Kept separate from the base Schedule type so admin-facing reads (findAll,
// findActiveRoutes) aren't forced to carry a field that only makes sense
// alongside a date.
export type ScheduleWithAvailability = Schedule & { seatsAvailable: number };

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,

    @InjectModel(City.name)
    private readonly cityModel: Model<CityDocument>,

    @InjectModel(Shuttle.name)
    private readonly shuttleModel: Model<ShuttleDocument>,
  ) {}

  /**
   * Live seats remaining for one schedule on one calendar date.
   *
   * Counts RESERVED + PAID bookings that use this schedule for that date —
   * on EITHER leg (a schedule can be someone's outbound trip and someone
   * else's return trip on the same date, and both compete for the same
   * physical seats). This is intentionally broader than the per-leg check
   * ShuttleServicesService.getAvailableSeats does during booking creation
   * (which only needs to check the one role it's being booked as); a
   * read-only "how many seats are left" answer needs both.
   */
  async getAvailableSeats(scheduleId: string, date: string): Promise<number> {
    const schedule = await this.scheduleModel.findById(scheduleId).lean();
    if (!schedule) return 0;

    const result = await this.shuttleModel.aggregate<{ total: number }>([
      {
        $match: {
          $or: [
            {
              'schedule.outbound': new Types.ObjectId(scheduleId),
              travelDate: date,
            },
            {
              'schedule.return': new Types.ObjectId(scheduleId),
              returnDate: date,
            },
          ],
          status: {
            $in: [ShuttleBookingStatus.RESERVED, ShuttleBookingStatus.PAID],
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$seatCount' } } },
    ]);

    const bookedSeats = result.length > 0 ? result[0].total : 0;
    return Math.max(schedule.capacity - bookedSeats, 0);
  }

  /**
   * Search active schedules by route and date.
   *
   * Returns matching schedules with a live `seatsAvailable` figure for
   * departureDate — the static `capacity` field alone isn't enough for
   * riders to know if a trip is actually bookable.
   */
  async searchSchedules(
    query: SearchScheduleDto,
  ): Promise<ScheduleWithAvailability[]> {
    const { from, to, departureDate } = query;

    // ✅ Prevent invalid route
    if (from === to) {
      throw new BadRequestException(
        'Origin and destination cannot be the same',
      );
    }

    // ✅ Validate cities exist
    const [fromCity, toCity] = await Promise.all([
      this.cityModel.exists({ code: from }),
      this.cityModel.exists({ code: to }),
    ]);

    if (!fromCity || !toCity) {
      throw new BadRequestException('Invalid city selection');
    }

    // ✅ Parse date safely (local time)
    const travelDate = new Date(`${departureDate}T00:00:00`);

    if (Number.isNaN(travelDate.getTime())) {
      throw new BadRequestException(
        'Invalid departureDate format. Use YYYY-MM-DD',
      );
    }

    // ✅ Prevent past searches
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (travelDate < today) {
      throw new BadRequestException('Cannot search for past dates');
    }

    // ✅ Get weekday
    const weekday = getWeekDay(departureDate);

    // ✅ Query
    const schedules = await this.scheduleModel
      .find({
        from,
        to,
        isActive: true,
        operatingDays: weekday,
      })
      .lean()
      .exec();

    // ✅ Attach live seat availability for departureDate to each match
    //
    // .lean() skips Mongoose hydration, so schema defaults (e.g. vehicleImages:
    // []) never get applied — schedules created before that field existed come
    // back with it simply missing, not an empty array. Normalize here so
    // consumers can always safely index into these arrays.
    return Promise.all(
      schedules.map(async (schedule) => ({
        ...schedule,
        vehicleImages: schedule.vehicleImages ?? [],
        plans: schedule.plans ?? [],
        seatsAvailable: await this.getAvailableSeats(
          schedule._id.toString(),
          departureDate,
        ),
      })),
    );
  }

  /**
   * Create a new schedule. Admin only.
   */
  async createSchedule(payload: CreateScheduleDto): Promise<Schedule> {
    const {
      from,
      to,
      departureTime,
      capacity,
      basePrice,
      operatingDays,
      isActive,
      name,
      vehicle,
      vehicleImages,
      plans,
    } = payload;

    if (from === to) {
      throw new ConflictException('Origin and destination cannot be the same');
    }

    const fromCity = await this.cityModel.exists({ code: from });
    const toCity = await this.cityModel.exists({ code: to });

    if (!fromCity || !toCity) {
      throw new BadRequestException('Invalid city selection');
    }

    const code = `${from}-${to}-${Date.now().toString(36)}`;

    this.assertSinglePlanMatchesBasePrice(basePrice, plans);

    const schedule = await this.scheduleModel.create({
      code,
      name,
      from,
      to,
      departureTime,
      capacity,
      basePrice,
      operatingDays,
      isActive: isActive ?? true,
      vehicle,
      vehicleImages: vehicleImages ?? [],
      plans: plans ?? [],
    });

    return schedule;
  }

  // Admin-only endpoint to list all schedules (for management purposes).
  async findAll(): Promise<Schedule[]> {
    return this.scheduleModel
      .find()
      .sort({ createdAt: -1 }) // newest first
      .lean()
      .exec();
  }

  // Public: list all ACTIVE routes for the NShuttle rider page (no auth).
  async findActiveRoutes(): Promise<Schedule[]> {
    return this.scheduleModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Admin-only endpoint to update schedule details. Partial updates allowed.
  async updateSchedule(
    id: string,
    payload: UpdateSchedulePayload,
  ): Promise<Schedule> {
    // ❌ Block route modification
    if (
      (payload as Partial<CreateScheduleDto>).from ||
      (payload as Partial<CreateScheduleDto>).to
    ) {
      throw new BadRequestException('Route cannot be changed');
    }

    // ✅ Validate fields individually

    if (payload.capacity !== undefined && payload.capacity <= 0) {
      throw new BadRequestException('Capacity must be greater than 0');
    }

    if (payload.basePrice !== undefined && payload.basePrice < 0) {
      throw new BadRequestException('Base price cannot be negative');
    }

    if (payload.departureTime !== undefined) {
      const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(
        payload.departureTime,
      );

      if (!isValidTime) {
        throw new BadRequestException('departureTime must be in HH:mm format');
      }
    }

    if (payload.operatingDays !== undefined) {
      const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

      const isValid = payload.operatingDays.every((day) =>
        validDays.includes(day),
      );

      if (!isValid) {
        throw new BadRequestException('Invalid operating days');
      }
    }

    // ✅ Keep basePrice and the "single" plan's price in sync ────────────────
    //
    // This is a partial update — only re-validate when either basePrice or
    // plans is actually being touched, and compare against the *resulting*
    // state (new value where provided, existing value otherwise). Two calls
    // that each patch only one side of the pair (e.g. one PATCH changes
    // basePrice, a later one changes plans) would otherwise sail through
    // individually and leave the two silently out of sync.
    if (payload.basePrice !== undefined || payload.plans !== undefined) {
      const existing = await this.scheduleModel.findById(id).lean();
      if (!existing) {
        throw new BadRequestException('Schedule not found');
      }

      const effectiveBasePrice = payload.basePrice ?? existing.basePrice;
      const effectivePlans = payload.plans ?? existing.plans;

      this.assertSinglePlanMatchesBasePrice(effectiveBasePrice, effectivePlans);
    }

    // ✅ Update safely
    const updated = await this.scheduleModel
      .findByIdAndUpdate(id, payload, {
        new: true,
      })
      .lean()
      .exec();

    if (!updated) {
      throw new BadRequestException('Schedule not found');
    }

    return updated;
  }

  // ── Guard: basePrice and the "single" plan's price must never diverge ──────
  //
  // basePrice is the per-trip fare charged when a booking doesn't select a
  // plan (see shuttle-services.service.ts). The "single" plan is meant to be
  // the exact same fare, just exposed as an explicit bundle option — the two
  // are supposed to be one price shown two ways, not two independently
  // editable numbers. Left unguarded, editing one in the admin panel without
  // the other silently produces a route where booking with vs. without
  // planKey=single charges two different amounts for an identical trip.
  private assertSinglePlanMatchesBasePrice(
    basePrice: number,
    plans: SchedulePlanInput[] | undefined,
  ): void {
    const singlePlan = plans?.find((plan) => plan.key === 'single');

    if (singlePlan && singlePlan.price !== basePrice) {
      throw new BadRequestException(
        `The "single" plan's price (${singlePlan.price}) must match basePrice (${basePrice}). ` +
          'They represent the same per-trip fare — update both together.',
      );
    }
  }

  // Admin-only endpoint to toggle schedule active status (soft delete).
  async toggleSchedule(id: string) {
    const schedule = await this.scheduleModel.findById(id);

    if (!schedule) {
      throw new BadRequestException('Schedule not found');
    }

    schedule.isActive = !schedule.isActive;
    await schedule.save();

    return schedule;
  }

  // Admin-only endpoint to permanently delete a schedule (hard delete).
  //
  // Guard: refuses to delete a schedule that still has bookings referencing
  // it (as either the outbound or return leg) in a non-terminal state
  // (RESERVED, PAID, REFUND_PENDING). Deleting it anyway would orphan those
  // bookings — Mongoose's populate('schedule.outbound'/'return') returns
  // null for a dangling reference, which breaks any UI that reads route
  // details off a booking (see MyPlanClient in nshuttle). EXPIRED, REFUNDED,
  // and CANCELLED bookings don't block deletion since nothing live depends
  // on the route info anymore.
  async deleteSchedule(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid schedule ID');
    }

    const scheduleId = new Types.ObjectId(id);

    const activeBookingCount = await this.shuttleModel.countDocuments({
      $or: [{ 'schedule.outbound': scheduleId }, { 'schedule.return': scheduleId }],
      status: {
        $in: [
          ShuttleBookingStatus.RESERVED,
          ShuttleBookingStatus.PAID,
          ShuttleBookingStatus.REFUND_PENDING,
        ],
      },
    });

    if (activeBookingCount > 0) {
      throw new BadRequestException(
        `Cannot delete this schedule — ${activeBookingCount} active booking${activeBookingCount !== 1 ? 's' : ''} still reference it. ` +
          'Deactivate the schedule instead (toggle it off), or wait for those bookings to reach a terminal state.',
      );
    }

    const deleted = await this.scheduleModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new BadRequestException('Schedule not found');
    }

    return { message: 'Schedule deleted' };
  }
}
