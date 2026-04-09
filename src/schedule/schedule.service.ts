// Schedule Service
// src/schedule/schedule.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Schedule, ScheduleDocument } from './schema/schedule.schema';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { getWeekDay } from '../common/utils/get-weekday.util';
import { City, CityDocument } from '../city/schema/city.schema';
import { UpdateSchedulePayload } from './types/UpdateSchedulePayload';
// import { CityDocument } from '../city/schema/city.schema';
@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,

    @InjectModel(City.name)
    private readonly cityModel: Model<CityDocument>,
  ) {}

  /**
   * Search active schedules by route and date.
   *
   * Returns matching schedules for the frontend to display.
   * Seat availability per schedule is NOT calculated here —
   * that happens server-side at booking creation time via getAvailableSeats.
   */
  async searchSchedules(query: SearchScheduleDto): Promise<Schedule[]> {
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
    return this.scheduleModel
      .find({
        from,
        to,
        isActive: true,
        operatingDays: weekday,
      })
      .lean()
      .exec();
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

    const schedule = await this.scheduleModel.create({
      code,
      from,
      to,
      departureTime,
      capacity,
      basePrice,
      operatingDays,
      isActive: isActive ?? true,
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
  async deleteSchedule(id: string) {
    const deleted = await this.scheduleModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new BadRequestException('Schedule not found');
    }

    return { message: 'Schedule deleted' };
  }
}
