import { Test, TestingModule } from '@nestjs/testing';
import { CareerJobsService } from './career-jobs.service';

describe('CareerJobsService', () => {
  let service: CareerJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CareerJobsService],
    }).compile();

    service = module.get<CareerJobsService>(CareerJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
