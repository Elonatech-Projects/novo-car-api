import { Test, TestingModule } from '@nestjs/testing';
import { FleetManagementController } from './fleet-management.controller';

describe('FleetManagementController', () => {
  let controller: FleetManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FleetManagementController],
    }).compile();

    controller = module.get<FleetManagementController>(FleetManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
