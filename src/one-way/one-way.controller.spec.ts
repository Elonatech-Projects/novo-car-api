import { Test, TestingModule } from '@nestjs/testing';
import { OneWayController } from './one-way.controller';

describe('OneWayController', () => {
  let controller: OneWayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OneWayController],
    }).compile();

    controller = module.get<OneWayController>(OneWayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
