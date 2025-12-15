import { Test, TestingModule } from '@nestjs/testing';
import { GuestBookingService } from './guest-booking.service';

describe('GuestBookingService', () => {
  let service: GuestBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuestBookingService],
    }).compile();

    service = module.get<GuestBookingService>(GuestBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
