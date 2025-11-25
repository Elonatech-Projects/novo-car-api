import { Test, TestingModule } from '@nestjs/testing';
import { ShuttleServicesController } from './shuttle-services.controller';

describe('ShuttleServicesController', () => {
  let controller: ShuttleServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShuttleServicesController],
    }).compile();

    controller = module.get<ShuttleServicesController>(ShuttleServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
