import { Test, TestingModule } from '@nestjs/testing';
import { GuestBookingController } from './guest-booking.controller';

describe('GuestBookingController', () => {
  let controller: GuestBookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestBookingController],
    }).compile();

    controller = module.get<GuestBookingController>(GuestBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
