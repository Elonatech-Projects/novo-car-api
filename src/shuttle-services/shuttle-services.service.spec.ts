import { Test, TestingModule } from '@nestjs/testing';
import { ShuttleServicesService } from './shuttle-services.service';

describe('ShuttleServicesService', () => {
  let service: ShuttleServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShuttleServicesService],
    }).compile();

    service = module.get<ShuttleServicesService>(ShuttleServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
