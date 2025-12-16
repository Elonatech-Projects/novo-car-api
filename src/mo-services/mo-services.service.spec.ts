import { Test, TestingModule } from '@nestjs/testing';
import { MoServicesService } from './mo-services.service';

describe('MoServicesService', () => {
  let service: MoServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoServicesService],
    }).compile();

    service = module.get<MoServicesService>(MoServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
