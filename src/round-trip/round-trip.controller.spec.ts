import { Test, TestingModule } from '@nestjs/testing';
import { RoundTripController } from './round-trip.controller';

describe('RoundTripController', () => {
  let controller: RoundTripController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoundTripController],
    }).compile();

    controller = module.get<RoundTripController>(RoundTripController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
