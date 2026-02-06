import { Test, TestingModule } from '@nestjs/testing';
import { ShuttleBookingController } from './shuttle-booking.controller';

describe('ShuttleBookingController', () => {
  let controller: ShuttleBookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShuttleBookingController],
    }).compile();

    controller = module.get<ShuttleBookingController>(ShuttleBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
