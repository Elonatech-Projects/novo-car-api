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
@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
  ) {}

  /**
   * Search active schedules by route and date.
   *
   * Does NOT calculate seat availability yet.
   */
  async searchSchedules(query: SearchScheduleDto): Promise<Schedule[]> {
    const { from, to, departureDate } = query;

    const travelDate = new Date(departureDate);

    if (isNaN(travelDate.getTime())) {
      throw new BadRequestException(
        'Invalid departureDate format. Use YYYY-MM-DD',
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (travelDate < today) {
      throw new BadRequestException('Cannot search for past dates');
    }

    const weekday = getWeekDay(departureDate);

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
   * Create a new schedule (Admin only)
   */
  async createSchedule(payload: CreateScheduleDto): Promise<Schedule> {
    const {
      code,
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

    const existing = await this.scheduleModel.findOne({ code }).lean().exec();

    if (existing) {
      throw new ConflictException('Schedule code already exists');
    }

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
}
