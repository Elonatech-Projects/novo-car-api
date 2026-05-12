import { Test, TestingModule } from '@nestjs/testing';
import { BookingRequestController } from './booking-request.controller';
import { BookingRequestService } from './booking-request.service';

describe('BookingRequestController', () => {
  let controller: BookingRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingRequestController],
      providers: [BookingRequestService],
    }).compile();

    controller = module.get<BookingRequestController>(BookingRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
