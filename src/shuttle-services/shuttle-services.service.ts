import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Shuttle, ShuttleDocument } from './schema/shuttle-service.schema';
import { Connection, Model, Types } from 'mongoose';
import { CreateShuttleServicesDto } from './dto/create-shuttle-services.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Auth } from '../auth/schema/auth-schema';
import { Schedule, ScheduleDocument } from '../schedule/schema/schedule.schema';
import { getWeekDay } from '../common/utils/get-weekday.util';

@Injectable()
export class ShuttleServicesService {
  constructor(
    @InjectModel(Shuttle.name) private shuttleModel: Model<ShuttleDocument>,

    @InjectModel(Auth.name) private userModel: Model<Auth>,

    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,

    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async createShuttle(
    payload: CreateShuttleServicesDto,
    userId: string,
  ): Promise<Shuttle> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { scheduleId, travelDate, seatCount } = payload;

      const schedule = await this.scheduleModel
        .findById(scheduleId)
        .session(session);

      if (!schedule || !schedule.isActive) {
        throw new NotFoundException('Schedule not found or inactive');
      }

      // Validate date not in past
      const travel = new Date(travelDate);
      travel.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (travel < today) {
        throw new BadRequestException('Cannot book past dates');
      }

      // Validate operating day
      const weekday = getWeekDay(travelDate);

      if (!schedule.operatingDays.includes(weekday)) {
        throw new BadRequestException(
          `Schedule does not operate on ${weekday}`,
        );
      }

      const now = new Date();

      // Lazy cleanup
      await this.shuttleModel.updateMany(
        {
          status: 'reserved',
          expiresAt: { $lt: now },
        },
        {
          $set: { status: 'expired' },
        },
        { session },
      );

      type SeatAggregationResult = {
        _id: null;
        total: number;
      };

      const reservedSeats = await this.shuttleModel
        .aggregate<SeatAggregationResult>([
          {
            $match: {
              scheduleId: new Types.ObjectId(scheduleId),
              travelDate,
              status: { $in: ['reserved', 'paid'] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$seatCount' },
            },
          },
        ])
        .session(session);

      const alreadyBooked =
        reservedSeats.length > 0 ? reservedSeats[0].total : 0;

      const availableSeats = schedule.capacity - alreadyBooked;

      if (seatCount > availableSeats) {
        throw new BadRequestException(`Only ${availableSeats} seats available`);
      }

      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

      const totalAmount = schedule.basePrice * seatCount;

      const booking = await this.shuttleModel.create(
        [
          {
            scheduleId,
            travelDate,
            userId,
            seatCount,
            totalAmount,
            status: 'reserved',
            expiresAt,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return booking[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
