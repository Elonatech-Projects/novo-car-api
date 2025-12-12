import { Test, TestingModule } from '@nestjs/testing';
import { AdminBookingService } from './admin-booking.service';

describe('AdminBookingService', () => {
  let service: AdminBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminBookingService],
    }).compile();

    service = module.get<AdminBookingService>(AdminBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
