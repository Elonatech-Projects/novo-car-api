import { Test, TestingModule } from '@nestjs/testing';
import { LeaseOptionsService } from './lease-options.service';

describe('LeaseOptionsService', () => {
  let service: LeaseOptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaseOptionsService],
    }).compile();

    service = module.get<LeaseOptionsService>(LeaseOptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
