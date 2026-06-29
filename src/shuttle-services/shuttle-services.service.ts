// src/shuttle-services/shuttle-services.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Connection, Model, Types, ClientSession } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Shuttle, ShuttleDocument } from './schema/shuttle-service.schema';
import { CreateShuttleServicesDto } from './dto/create-shuttle-services.dto';
import { FindAllShuttleServicesDto } from './dto/find-all-shuttle-services.dto';
import { Auth } from '../auth/schema/auth-schema';
import { Schedule, ScheduleDocument } from '../schedule/schema/schedule.schema';
import { getWeekDay } from '../common/utils/get-weekday.util';
import { ShuttleBookingStatus } from '../common/enums/shuttle-booking.enum';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatedBookingResult {
  bookingId: string;
  totalAmount: number;
  expiresAt: Date;
}

// A bookable NShuttle plan as stored on a Schedule route.
interface RoutePlan {
  key: string;
  label: string;
  trips: number;
  price: number;
}

/**
 * Internal shape used only inside this service.
 * Keeps getAvailableSeats unambiguous about which leg it is checking.
 */
interface SeatCheckParams {
  scheduleId: string;
  /** 'outbound' checks bookings where schedule.outbound === scheduleId on travelDate.
   *  'return'   checks bookings where schedule.return   === scheduleId on returnDate. */
  leg: 'outbound' | 'return';
  date: string; // YYYY-MM-DD
  session: ClientSession;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ShuttleServicesService {
  private readonly logger = new Logger(ShuttleServicesService.name);

  constructor(
    @InjectModel(Shuttle.name)
    private readonly shuttleModel: Model<ShuttleDocument>,

    @InjectModel(Auth.name)
    private readonly userModel: Model<Auth>,

    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,

    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  // ── Public: create booking ──────────────────────────────────────────────────

  async createShuttle(
    payload: CreateShuttleServicesDto,
    userId: string,
  ): Promise<CreatedBookingResult> {
    // All the booking logic runs inside a transaction to ensure atomicity and consistency.
    // If any step fails (validation, availability check, booking creation), the transaction aborts and rolls back all changes.
    const session = await this.connection.startSession();
    // Transactions require an explicit start in Mongoose.
    session.startTransaction();

    try {
      // The main booking logic is in a separate private method that receives the session as a parameter.
      const result = await this._createShuttleWithSession(
        payload,
        userId,
        session,
      );
      // If we reach this point, all operations were successful and we can commit the transaction to persist the changes.
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // ── Private: main logic (runs inside the session) ──────────────────────────

  private async _createShuttleWithSession(
    payload: CreateShuttleServicesDto,
    userId: string,
    session: ClientSession,
  ): Promise<CreatedBookingResult> {
    const {
      schedule,
      returnDate,
      travelDate,
      seatCount,
      passengers,
      isRoundTrip,
      planKey,
    } = payload;

    // ── 1. Basic validation ──────────────────────────────────────────────────

    if (!Types.ObjectId.isValid(schedule.outbound)) {
      throw new BadRequestException('Invalid outbound schedule ID');
    }

    if (isRoundTrip && !schedule.return) {
      throw new BadRequestException(
        'Return schedule ID is required for round-trip bookings',
      );
    }

    if (isRoundTrip && !returnDate) {
      throw new BadRequestException(
        'Return date is required for round-trip bookings',
      );
    }

    if (!isRoundTrip && schedule.return) {
      throw new BadRequestException(
        'Return schedule is not allowed for one-way bookings',
      );
    }

    if (seatCount < 1 || passengers.length !== seatCount) {
      throw new BadRequestException(
        `Passenger count (${passengers.length}) must match seatCount (${seatCount})`,
      );
    }

    // Exactly one primary passenger is required to ensure we have a main contact for the booking.
    const primaryPassengers = passengers.filter((p) => p.isPrimary);
    if (primaryPassengers.length !== 1) {
      throw new BadRequestException(
        'Exactly one primary passenger is required',
      );
    }

    // ── 2. Verify user exists (inside session for consistency) ───────────────

    const user = await this.userModel.findById(userId).session(session);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ── 3. Fetch and validate schedules ─────────────────────────────────────

    // Both fetches run outside the session intentionally:
    // Schedule documents are read-only in this flow and don't need snapshot isolation.
    const outboundSchedule = await this.scheduleModel
      .findById(schedule.outbound)
      .lean();

    if (!outboundSchedule || !outboundSchedule.isActive) {
      throw new NotFoundException(
        'Outbound schedule not found or is no longer active',
      );
    }

    // Return schedule is optional (only for round-trip), so we initialize it as null and only fetch if needed.
    let returnSchedule: typeof outboundSchedule | null = null;

    if (isRoundTrip && schedule.return) {
      if (!Types.ObjectId.isValid(schedule.return)) {
        throw new BadRequestException('Invalid return schedule ID');
      }

      // Fetch return schedule if it's a round trip. We need it for validation and price calculation later.
      returnSchedule = await this.scheduleModel
        .findById(schedule.return)
        .lean();

      if (!returnSchedule || !returnSchedule.isActive) {
        throw new NotFoundException(
          'Return schedule not found or is no longer active',
        );
      }
    }

    // ── 4. Date validation ───────────────────────────────────────────────────

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const travelDay = new Date(`${travelDate}T00:00:00`);
    if (travelDay < today) {
      throw new BadRequestException('Travel date cannot be in the past');
    }

    const outboundWeekday = getWeekDay(travelDate);
    if (!outboundSchedule.operatingDays.includes(outboundWeekday)) {
      throw new BadRequestException(
        `Outbound schedule does not operate on ${outboundWeekday}s`,
      );
    }

    if (isRoundTrip && returnDate && returnSchedule) {
      const returnDay = new Date(`${returnDate}T00:00:00`);
      if (returnDay < travelDay) {
        throw new BadRequestException(
          'Return date cannot be before the travel date',
        );
      }

      const returnWeekday = getWeekDay(returnDate);
      if (!returnSchedule.operatingDays.includes(returnWeekday)) {
        throw new BadRequestException(
          `Return schedule does not operate on ${returnWeekday}s`,
        );
      }
    }

    // ── 5. Clean expired reservations before checking availability ───────────
    //
    // We do this inside the transaction so the cleanup and the new booking
    // are atomic. If two requests race, only one can commit — the other
    // aborts and retries, at which point it will see the freshly cleaned state.

    const now = new Date();

    // This query finds all bookings that are still marked as RESERVED but have an expiresAt in the past, meaning their reservation window has expired. It updates their status to EXPIRED to free up those seats for new bookings.
    await this.shuttleModel.updateMany(
      {
        $or: [
          { 'schedule.outbound': new Types.ObjectId(schedule.outbound) },
          ...(schedule.return
            ? [{ 'schedule.return': new Types.ObjectId(schedule.return) }]
            : []),
        ],
        status: ShuttleBookingStatus.RESERVED,
        expiresAt: { $lt: now },
      },
      { $set: { status: ShuttleBookingStatus.EXPIRED } },
      { session },
    );

    // ── 6. Seat availability check ───────────────────────────────────────────
    //
    // IMPORTANT: outbound and return availability are checked independently.
    // Each check only counts bookings for the specific leg + date combination
    // to avoid the double-count bug (see getAvailableSeats comments below).

    const outboundAvailable = await this.getAvailableSeats({
      scheduleId: schedule.outbound,
      leg: 'outbound',
      date: travelDate,
      session,
    });

    if (seatCount > outboundAvailable) {
      throw new BadRequestException(
        `Only ${outboundAvailable} outbound seat${outboundAvailable !== 1 ? 's' : ''} available for ${travelDate}`,
      );
    }

    if (isRoundTrip && returnSchedule && returnDate && schedule.return) {
      const returnAvailable = await this.getAvailableSeats({
        scheduleId: schedule.return,
        leg: 'return',
        date: returnDate,
        session,
      });

      if (seatCount > returnAvailable) {
        throw new BadRequestException(
          `Only ${returnAvailable} return seat${returnAvailable !== 1 ? 's' : ''} available for ${returnDate}`,
        );
      }
    }

    // ── 7. Calculate price ───────────────────────────────────────────────────
    //
    // Always calculated server-side from fetched schedule prices.
    // The frontend total is only for display — never trusted here.

    let totalAmount = outboundSchedule.basePrice * seatCount;

    if (returnSchedule) {
      totalAmount += returnSchedule.basePrice * seatCount;
    }

    // ── 7b. NShuttle plan pricing override ───────────────────────────────────
    // If a plan was chosen, price the booking at the plan's fixed bundle price
    // (× seatCount) instead of the per-trip basePrice. The plan must exist on
    // the outbound schedule — we never trust a price from the client.
    let selectedPlan: RoutePlan | undefined;

    if (planKey) {
      // `lean()` returns loosely-typed docs, so cast the plans array explicitly.
      const routePlans: RoutePlan[] = Array.isArray(outboundSchedule.plans)
        ? (outboundSchedule.plans as RoutePlan[])
        : [];
      selectedPlan = routePlans.find((p) => p.key === planKey);
      if (!selectedPlan) {
        throw new BadRequestException(
          `Plan "${planKey}" is not available for this route`,
        );
      }
      totalAmount = selectedPlan.price * seatCount;
    }

    // ── 8. Create booking ────────────────────────────────────────────────────

    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 min reservation window

    // mongoose create() with a session requires array syntax
    const [booking] = await this.shuttleModel.create(
      [
        {
          schedule: {
            outbound: new Types.ObjectId(schedule.outbound),
            ...(isRoundTrip && schedule.return
              ? { return: new Types.ObjectId(schedule.return) }
              : {}),
          },
          isRoundTrip,
          travelDate,
          ...(isRoundTrip && returnDate ? { returnDate } : {}),
          userId: new Types.ObjectId(userId),
          seatCount,
          totalAmount,
          ...(selectedPlan
            ? {
                planKey: selectedPlan.key,
                planLabel: selectedPlan.label,
                planTrips: selectedPlan.trips,
              }
            : {}),
          status: ShuttleBookingStatus.RESERVED,
          expiresAt,
          passengers,
        },
      ],
      { session },
    );

    return {
      bookingId: booking._id.toString(),
      totalAmount,
      expiresAt,
    };
  }

  // ── Private: seat availability ──────────────────────────────────────────────
  //
  // This method checks available seats for ONE specific leg of a booking.
  //
  // The old implementation matched BOTH schedule.outbound AND schedule.return
  // against the same scheduleId in a single $or query. This caused a bug:
  // when checking return availability, outbound bookings for the same schedule
  // were also counted as occupied seats — inflating the count and potentially
  // blocking valid bookings.
  //
  // Fix: each leg has its own match path:
  //   outbound → match { 'schedule.outbound': scheduleId, travelDate: date }
  //   return   → match { 'schedule.return':   scheduleId, returnDate: date  }
  //
  // This ensures that a schedule used as both an outbound on one day and a
  // return on another day counts its seats independently per leg per date.

  private async getAvailableSeats(params: SeatCheckParams): Promise<number> {
    const { scheduleId, leg, date, session } = params;

    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException(`Invalid ${leg} schedule ID`);
    }

    // Fetch the schedule to get its capacity and operating days. We also verify it exists and is active. This is done inside the session to ensure we have a consistent view of the schedule document while we check availability and create the booking. If the schedule is inactive or doesn't exist, we throw a NotFoundException to indicate that the requested schedule cannot be booked against. This prevents bookings on invalid schedules and ensures data integrity.
    const schedule = await this.scheduleModel
      .findById(scheduleId)
      .session(session)
      .lean();

    if (!schedule || !schedule.isActive) {
      throw new NotFoundException(
        `${leg === 'outbound' ? 'Outbound' : 'Return'} schedule not found or inactive`,
      );
    }

    // Build the match for this specific leg + date combination only
    const matchFilter =
      leg === 'outbound'
        ? {
            'schedule.outbound': new Types.ObjectId(scheduleId),
            travelDate: date,
            status: {
              $in: [ShuttleBookingStatus.RESERVED, ShuttleBookingStatus.PAID],
            },
          }
        : {
            'schedule.return': new Types.ObjectId(scheduleId),
            returnDate: date,
            status: {
              $in: [ShuttleBookingStatus.RESERVED, ShuttleBookingStatus.PAID],
            },
          };

    // Aggregate bookings matching the filter and sum their seatCount to get total booked seats for this leg + date. We use aggregation here because we need to sum across potentially many documents, and this is more efficient than fetching them all and summing in application code. The session ensures that we see a consistent view of the bookings while we calculate availability and create the new booking.
    const result = await this.shuttleModel
      .aggregate<{
        total: number;
      }>([
        { $match: matchFilter },
        { $group: { _id: null, total: { $sum: '$seatCount' } } },
      ])
      .session(session);

    const bookedSeats = result.length > 0 ? result[0].total : 0;

    return Math.max(schedule.capacity - bookedSeats, 0);
  }

  async getAllBookings(): Promise<Shuttle[]> {
    return this.shuttleModel.find().sort({ createdAt: -1 }).lean().exec();
  }
  // ── ADMIN: fetch all bookings with filters ──────────────────────────────────

  async findAll(filters: FindAllShuttleServicesDto): Promise<{
    success: boolean;
    total: number;
    page: number;
    pages: number;
    data: ShuttleDocument[];
  }> {
    const {
      isRoundTrip,
      status,
      seatCount,
      travelDate,
      page = 1,
      limit = 20,
    } = filters;

    // Build the query object dynamically — only include fields that were passed
    const query: Record<string, unknown> = {};
    if (isRoundTrip !== undefined) query.isRoundTrip = isRoundTrip;
    if (status) query.status = status;
    if (seatCount !== undefined) query.seatCount = seatCount;
    if (travelDate) query.travelDate = travelDate;

    const skip = (page - 1) * limit;

    // ↓ Sorted by createdAt descending — most recent bookings appear first
    const [data, total] = await Promise.all([
      this.shuttleModel
        .find(query)
        .sort({ createdAt: -1 }) // ← DESCENDING ORDER (newest first)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.shuttleModel.countDocuments(query),
    ]);

    this.logger.log(
      `Admin fetched shuttle bookings — filters: ${JSON.stringify(query)}, total: ${total}`,
    );

    return {
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: data as unknown as ShuttleDocument[],
    };
  }

  // ── ADMIN: delete a booking ─────────────────────────────────────────────────
  //
  // Safety guards prevent deletion of records needed for payment reconciliation:
  //
  //  RESERVED      → blocked. A payment may be in-flight (15-min window active).
  //                  If Paystack debits the user but returns "failed", this record
  //                  is the only proof of the transaction — do not delete.
  //
  //  PAID          → blocked. Payment confirmed. Must go through refund flow first.
  //
  //  REFUND_PENDING → blocked. Paystack refund is in progress — deleting now would
  //                  break the reconciliation trail.
  //
  //  EXPIRED / REFUNDED / CANCELLED → safe to delete. No active payment involved.

  async deleteBooking(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const booking = await this.shuttleModel.findById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // ── Guard: payment in-flight ─────────────────────────────────────────────
    if (booking.status === ShuttleBookingStatus.RESERVED) {
      throw new BadRequestException(
        'Cannot delete a RESERVED booking — a payment may currently be in progress. ' +
          'The reservation expires automatically after 15 minutes. Delete it once it shows as EXPIRED.',
      );
    }

    // ── Guard: payment confirmed ─────────────────────────────────────────────
    if (booking.status === ShuttleBookingStatus.PAID) {
      throw new BadRequestException(
        'Cannot delete a PAID booking. Payment has been confirmed. ' +
          'If a refund is required, use the refund endpoint instead.',
      );
    }

    // ── Guard: refund in progress ────────────────────────────────────────────
    if (booking.status === ShuttleBookingStatus.REFUND_PENDING) {
      throw new BadRequestException(
        'Cannot delete a booking while a Paystack refund is pending. ' +
          'Wait for the refund to complete (status: REFUNDED) before deleting.',
      );
    }

    // Safe statuses: EXPIRED | REFUNDED | CANCELLED
    await this.shuttleModel.findByIdAndDelete(id);

    this.logger.log(
      `Admin deleted shuttle booking ${id} (was ${booking.status})`,
    );

    return {
      success: true,
      message: `Booking deleted successfully`,
    };
  }
}
