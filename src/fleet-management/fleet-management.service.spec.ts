import { Test, TestingModule } from '@nestjs/testing';
import { FleetManagementService } from './fleet-management.service';

describe('FleetManagementService', () => {
  let service: FleetManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FleetManagementService],
    }).compile();

    service = module.get<FleetManagementService>(FleetManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
