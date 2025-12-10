import { Test, TestingModule } from '@nestjs/testing';
import { ShuttleTripController } from './trip.controller';

describe('ShuttleTripController', () => {
  let controller: ShuttleTripController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShuttleTripController],
    }).compile();

    controller = module.get<ShuttleTripController>(ShuttleTripController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
