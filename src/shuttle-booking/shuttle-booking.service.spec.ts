import { Test, TestingModule } from '@nestjs/testing';
import { ShuttleBookingService } from './shuttle-booking.service';

describe('ShuttleBookingService', () => {
  let service: ShuttleBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShuttleBookingService],
    }).compile();

    service = module.get<ShuttleBookingService>(ShuttleBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
