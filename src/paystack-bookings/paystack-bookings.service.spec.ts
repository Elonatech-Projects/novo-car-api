import { Test, TestingModule } from '@nestjs/testing';
import { PaystackBookingsService } from './paystack-bookings.service';

describe('PaystackBookingsService', () => {
  let service: PaystackBookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaystackBookingsService],
    }).compile();

    service = module.get<PaystackBookingsService>(PaystackBookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
