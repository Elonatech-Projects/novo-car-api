import { Test, TestingModule } from '@nestjs/testing';
import { PaystackBookingsController } from './paystack-bookings.controller';

describe('PaystackBookingsController', () => {
  let controller: PaystackBookingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaystackBookingsController],
    }).compile();

    controller = module.get<PaystackBookingsController>(PaystackBookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
