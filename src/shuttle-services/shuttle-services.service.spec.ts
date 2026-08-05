import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ShuttleServicesService } from './shuttle-services.service';
import { Shuttle } from './schema/shuttle-service.schema';
import { Auth } from '../auth/schema/auth-schema';
import { Schedule } from '../schedule/schema/schedule.schema';
import { ShuttleBookingStatus } from '../common/enums/shuttle-booking.enum';
import { CreateShuttleServicesDto } from './dto/create-shuttle-services.dto';

describe('ShuttleServicesService', () => {
  let service: ShuttleServicesService;

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };

  // Chainable query mock helper — supports .session().lean() etc in any order.
  // `lean()` is both terminal (awaited directly) and chainable (`.lean().exec()`),
  // so it returns an object that is itself thenable as well as chainable.
  const chainable = (resolvedValue: unknown) => {
    const obj: any = {};
    obj.session = jest.fn().mockReturnValue(obj);
    obj.lean = jest.fn().mockReturnValue(obj);
    obj.populate = jest.fn().mockReturnValue(obj);
    obj.sort = jest.fn().mockReturnValue(obj);
    obj.skip = jest.fn().mockReturnValue(obj);
    obj.limit = jest.fn().mockReturnValue(obj);
    obj.exec = jest.fn().mockResolvedValue(resolvedValue);
    obj.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(resolvedValue).then(resolve, reject);
    return obj;
  };

  const mockAggregateSession = (total: number | null) => ({
    session: jest.fn().mockResolvedValue(
      total === null ? [] : [{ total }],
    ),
  });

  const mockShuttleModel: any = {
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockUserModel: any = {
    findById: jest.fn(),
  };

  const mockScheduleModel: any = {
    findById: jest.fn(),
  };

  const userId = new Types.ObjectId().toString();
  const outboundScheduleId = new Types.ObjectId().toString();
  const returnScheduleId = new Types.ObjectId().toString();

  const basePassenger = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '08012345678',
    isPrimary: true,
  };

  const futureDate = (daysFromNow: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().slice(0, 10);
  };

  const activeSchedule = (overrides: Record<string, unknown> = {}) => ({
    _id: outboundScheduleId,
    isActive: true,
    operatingDays: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    basePrice: 5000,
    capacity: 10,
    plans: [],
    ...overrides,
  });

  const basePayload = (
    overrides: Partial<CreateShuttleServicesDto> = {},
  ): CreateShuttleServicesDto =>
    ({
      schedule: { outbound: outboundScheduleId },
      isRoundTrip: false,
      travelDate: futureDate(2),
      seatCount: 1,
      passengers: [basePassenger],
      ...overrides,
    }) as CreateShuttleServicesDto;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShuttleServicesService,
        { provide: getModelToken(Shuttle.name), useValue: mockShuttleModel },
        { provide: getModelToken(Auth.name), useValue: mockUserModel },
        { provide: getModelToken(Schedule.name), useValue: mockScheduleModel },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    service = module.get<ShuttleServicesService>(ShuttleServicesService);

    // Sensible defaults for the happy path — individual tests override as needed.
    mockUserModel.findById.mockReturnValue(chainable({ _id: userId }));
    mockScheduleModel.findById.mockImplementation((id: string) =>
      chainable(
        id === outboundScheduleId
          ? activeSchedule()
          : id === returnScheduleId
            ? activeSchedule({ _id: returnScheduleId })
            : null,
      ),
    );
    mockShuttleModel.updateMany.mockResolvedValue({ modifiedCount: 0 });
    mockShuttleModel.aggregate.mockReturnValue(mockAggregateSession(0));
    mockShuttleModel.create.mockImplementation(
      async (docs: Record<string, unknown>[]) => [
        {
          _id: new Types.ObjectId(),
          ...docs[0],
        },
      ],
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── createShuttle ────────────────────────────────────────────────────────

  describe('createShuttle', () => {
    it('creates a one-way booking and commits the transaction', async () => {
      const result = await service.createShuttle(basePayload(), userId);

      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result.totalAmount).toBe(5000);
      expect(result.bookingId).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('rejects an invalid outbound schedule ObjectId', async () => {
      await expect(
        service.createShuttle(
          basePayload({ schedule: { outbound: 'not-an-id' } }),
          userId,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });

    it('requires a return schedule for round-trip bookings', async () => {
      await expect(
        service.createShuttle(
          basePayload({ isRoundTrip: true, schedule: { outbound: outboundScheduleId } }),
          userId,
        ),
      ).rejects.toThrow('Return schedule ID is required for round-trip bookings');
    });

    it('requires a return date for round-trip bookings', async () => {
      await expect(
        service.createShuttle(
          basePayload({
            isRoundTrip: true,
            schedule: { outbound: outboundScheduleId, return: returnScheduleId },
          }),
          userId,
        ),
      ).rejects.toThrow('Return date is required for round-trip bookings');
    });

    it('rejects a return schedule on a one-way booking', async () => {
      await expect(
        service.createShuttle(
          basePayload({
            schedule: { outbound: outboundScheduleId, return: returnScheduleId },
          }),
          userId,
        ),
      ).rejects.toThrow('Return schedule is not allowed for one-way bookings');
    });

    it('rejects when passenger count does not match seatCount', async () => {
      await expect(
        service.createShuttle(
          basePayload({ seatCount: 2, passengers: [basePassenger] }),
          userId,
        ),
      ).rejects.toThrow('Passenger count (1) must match seatCount (2)');
    });

    it('rejects when there is no primary passenger', async () => {
      await expect(
        service.createShuttle(
          basePayload({ passengers: [{ ...basePassenger, isPrimary: false }] }),
          userId,
        ),
      ).rejects.toThrow('Exactly one primary passenger is required');
    });

    it('rejects when there is more than one primary passenger', async () => {
      await expect(
        service.createShuttle(
          basePayload({
            seatCount: 2,
            passengers: [basePassenger, { ...basePassenger, isPrimary: true }],
          }),
          userId,
        ),
      ).rejects.toThrow('Exactly one primary passenger is required');
    });

    it('throws NotFoundException when the user does not exist', async () => {
      mockUserModel.findById.mockReturnValue(chainable(null));

      await expect(service.createShuttle(basePayload(), userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the outbound schedule is missing or inactive', async () => {
      mockScheduleModel.findById.mockReturnValue(chainable(null));

      await expect(service.createShuttle(basePayload(), userId)).rejects.toThrow(
        'Outbound schedule not found or is no longer active',
      );
    });

    it('rejects travel dates in the past', async () => {
      await expect(
        service.createShuttle(basePayload({ travelDate: '2000-01-01' }), userId),
      ).rejects.toThrow('Travel date cannot be in the past');
    });

    it('rejects a travel date the outbound schedule does not operate on', async () => {
      mockScheduleModel.findById.mockImplementation(() =>
        chainable(activeSchedule({ operatingDays: [] })),
      );

      await expect(service.createShuttle(basePayload(), userId)).rejects.toThrow(
        /does not operate on/,
      );
    });

    it('rejects when outbound seats requested exceed availability', async () => {
      mockShuttleModel.aggregate.mockReturnValue(mockAggregateSession(10));

      await expect(
        service.createShuttle(basePayload({ seatCount: 1 }), userId),
      ).rejects.toThrow(/outbound seat/);
    });

    it('creates a round-trip booking summing outbound + return prices', async () => {
      const result = await service.createShuttle(
        basePayload({
          isRoundTrip: true,
          schedule: { outbound: outboundScheduleId, return: returnScheduleId },
          returnDate: futureDate(5),
        }),
        userId,
      );

      expect(result.totalAmount).toBe(10000); // 5000 outbound + 5000 return
    });

    it('rejects a return date before the travel date', async () => {
      await expect(
        service.createShuttle(
          basePayload({
            isRoundTrip: true,
            schedule: { outbound: outboundScheduleId, return: returnScheduleId },
            travelDate: futureDate(5),
            returnDate: futureDate(2),
          }),
          userId,
        ),
      ).rejects.toThrow('Return date cannot be before the travel date');
    });

    it('prices using the selected plan instead of basePrice when planKey is provided', async () => {
      mockScheduleModel.findById.mockImplementation(() =>
        chainable(
          activeSchedule({
            plans: [{ key: 'weekly', label: 'Weekly Pass', trips: 5, price: 20000 }],
          }),
        ),
      );

      const result = await service.createShuttle(
        basePayload({ planKey: 'weekly', seatCount: 2, passengers: [basePassenger, { ...basePassenger, isPrimary: false }] }),
        userId,
      );

      expect(result.totalAmount).toBe(40000); // 20000 * 2 seats
    });

    it('rejects an unknown planKey', async () => {
      await expect(
        service.createShuttle(basePayload({ planKey: 'does-not-exist' }), userId),
      ).rejects.toThrow('Plan "does-not-exist" is not available for this route');
    });

    it('aborts the transaction and rethrows on failure', async () => {
      mockUserModel.findById.mockReturnValue(chainable(null));

      await expect(service.createShuttle(basePayload(), userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  // ── findMine ─────────────────────────────────────────────────────────────

  describe('findMine', () => {
    it('returns the current user bookings without a status filter', async () => {
      const bookings = [{ _id: '1' }];
      mockShuttleModel.find.mockReturnValue(chainable(bookings));

      const result = await service.findMine(userId);

      expect(mockShuttleModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
      expect(result).toEqual({ success: true, data: bookings });
    });

    it('applies a status filter when provided', async () => {
      mockShuttleModel.find.mockReturnValue(chainable([]));

      await service.findMine(userId, ShuttleBookingStatus.PAID);

      expect(mockShuttleModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
        status: ShuttleBookingStatus.PAID,
      });
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('paginates and applies filters', async () => {
      mockShuttleModel.find.mockReturnValue(chainable([{ _id: '1' }]));
      mockShuttleModel.countDocuments.mockResolvedValue(21);

      const result = await service.findAll({
        status: ShuttleBookingStatus.PAID,
        page: 2,
        limit: 10,
      } as any);

      expect(mockShuttleModel.find).toHaveBeenCalledWith({
        status: ShuttleBookingStatus.PAID,
      });
      expect(result.total).toBe(21);
      expect(result.pages).toBe(3);
      expect(result.page).toBe(2);
    });

    it('defaults to page 1 / limit 20 with an empty filter', async () => {
      mockShuttleModel.find.mockReturnValue(chainable([]));
      mockShuttleModel.countDocuments.mockResolvedValue(0);

      const result = await service.findAll({} as any);

      expect(result.page).toBe(1);
      expect(result.pages).toBe(0);
    });
  });

  // ── deleteBooking ────────────────────────────────────────────────────────

  describe('deleteBooking', () => {
    it('throws NotFoundException when the booking does not exist', async () => {
      mockShuttleModel.findById.mockResolvedValue(null);

      await expect(service.deleteBooking('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it.each([
      ShuttleBookingStatus.RESERVED,
      ShuttleBookingStatus.PAID,
      ShuttleBookingStatus.REFUND_PENDING,
    ])('blocks deletion of a %s booking', async (status) => {
      mockShuttleModel.findById.mockResolvedValue({ status });

      await expect(service.deleteBooking('some-id')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockShuttleModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it.each([
      ShuttleBookingStatus.EXPIRED,
      ShuttleBookingStatus.REFUNDED,
      ShuttleBookingStatus.CANCELLED,
    ])('allows deletion of a %s booking', async (status) => {
      mockShuttleModel.findById.mockResolvedValue({ status });
      mockShuttleModel.findByIdAndDelete.mockResolvedValue({});

      const result = await service.deleteBooking('some-id');

      expect(mockShuttleModel.findByIdAndDelete).toHaveBeenCalledWith('some-id');
      expect(result.success).toBe(true);
    });
  });

  // ── getAllBookings ───────────────────────────────────────────────────────

  describe('getAllBookings', () => {
    it('returns all bookings sorted by newest first', async () => {
      mockShuttleModel.find.mockReturnValue(chainable([{ _id: '1' }]));

      const result = await service.getAllBookings();

      expect(result).toEqual([{ _id: '1' }]);
    });
  });
});
