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
import { ShuttleBookingStatus } from '../common/enums/shuttle-booking.enum';

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

      if (!Types.ObjectId.isValid(scheduleId)) {
        throw new BadRequestException('Invalid schedule ID');
      }

      if (seatCount < 1) {
        throw new BadRequestException('Seat count must be at least 1');
      }

      // Validate user
      const user = await this.userModel.findById(userId).session(session);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate schedule
      const schedule = await this.scheduleModel
        .findById(scheduleId)
        .session(session);

      if (!schedule || !schedule.isActive) {
        throw new NotFoundException('Schedule not found or inactive');
      }

      // Validate date not in past
      const travel = new Date(`${travelDate}T00:00:00`);
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

      // 🔥 Expire only RESERVED bookings
      await this.shuttleModel.updateMany(
        {
          scheduleId,
          travelDate,
          status: ShuttleBookingStatus.RESERVED,
          expiresAt: { $lt: now },
        },
        {
          $set: {
            status: ShuttleBookingStatus.EXPIRED,
          },
        },
        { session },
      );

      // Aggregate reserved + paid seats
      const reservedSeats = await this.shuttleModel
        .aggregate<{ total: number }>([
          {
            $match: {
              scheduleId: new Types.ObjectId(scheduleId),
              travelDate,
              status: {
                $in: [ShuttleBookingStatus.RESERVED, ShuttleBookingStatus.PAID],
              },
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

      // Optional duplicate prevention
      const existingReservation = await this.shuttleModel
        .findOne({
          userId,
          scheduleId,
          travelDate,
          status: {
            $in: [ShuttleBookingStatus.RESERVED, ShuttleBookingStatus.PAID],
          },
        })
        .session(session);

      if (existingReservation) {
        throw new BadRequestException(
          'You already have a reservation for this schedule',
        );
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
            status: ShuttleBookingStatus.RESERVED,
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
