import { Test, TestingModule } from '@nestjs/testing';
import { ShuttleServicesController } from './shuttle-services.controller';
import { ShuttleServicesService } from './shuttle-services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { ShuttleBookingStatus } from '../common/enums/shuttle-booking.enum';

describe('ShuttleServicesController', () => {
  let controller: ShuttleServicesController;

  const mockShuttleServicesService = {
    createShuttle: jest.fn(),
    findMine: jest.fn(),
    findAll: jest.fn(),
    getAllBookings: jest.fn(),
    deleteBooking: jest.fn(),
  };

  const mockRequest = (userId: string) =>
    ({ user: { _id: userId } }) as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShuttleServicesController],
      providers: [
        { provide: ShuttleServicesService, useValue: mockShuttleServicesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ShuttleServicesController>(
      ShuttleServicesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createShuttleService', () => {
    it('delegates to the service using the authenticated user id and shapes the response', async () => {
      const expiresAt = new Date('2026-01-01T00:00:00.000Z');
      mockShuttleServicesService.createShuttle.mockResolvedValue({
        bookingId: 'booking-1',
        totalAmount: 5000,
        expiresAt,
      });

      const dto = { seatCount: 1 } as any;
      const result = await controller.createShuttleService(
        mockRequest('user-1'),
        dto,
      );

      expect(mockShuttleServicesService.createShuttle).toHaveBeenCalledWith(
        dto,
        'user-1',
      );
      expect(result).toEqual({
        success: true,
        message: 'Shuttle booking created successfully',
        data: {
          bookingId: 'booking-1',
          totalAmount: 5000,
          expiresAt: expiresAt.toISOString(),
        },
      });
    });
  });

  describe('findMine', () => {
    it('passes the authenticated user id and status filter through', async () => {
      mockShuttleServicesService.findMine.mockResolvedValue({
        success: true,
        data: [],
      });

      await controller.findMine(mockRequest('user-1'), {
        status: ShuttleBookingStatus.PAID,
      } as any);

      expect(mockShuttleServicesService.findMine).toHaveBeenCalledWith(
        'user-1',
        ShuttleBookingStatus.PAID,
      );
    });
  });

  describe('findAll', () => {
    it('delegates filters to the service', async () => {
      const filters = { page: 1, limit: 20 } as any;
      mockShuttleServicesService.findAll.mockResolvedValue({ success: true });

      await controller.findAll(filters);

      expect(mockShuttleServicesService.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('getAllBookings', () => {
    it('returns whatever the service returns', async () => {
      mockShuttleServicesService.getAllBookings.mockResolvedValue([{ _id: '1' }]);

      const result = await controller.getAllBookings();

      expect(result).toEqual([{ _id: '1' }]);
    });
  });

  describe('deleteBooking', () => {
    it('delegates the id to the service', async () => {
      mockShuttleServicesService.deleteBooking.mockResolvedValue({
        success: true,
        message: 'Booking deleted successfully',
      });

      const result = await controller.deleteBooking('booking-1');

      expect(mockShuttleServicesService.deleteBooking).toHaveBeenCalledWith(
        'booking-1',
      );
      expect(result.success).toBe(true);
    });
  });
});
