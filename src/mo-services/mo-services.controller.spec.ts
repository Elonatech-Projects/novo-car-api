import { Test, TestingModule } from '@nestjs/testing';
import { MoServicesController } from './mo-services.controller';

describe('MoServicesController', () => {
  let controller: MoServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoServicesController],
    }).compile();

    controller = module.get<MoServicesController>(MoServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
