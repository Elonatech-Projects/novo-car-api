import { Test, TestingModule } from '@nestjs/testing';
import { ShuttleTripService } from './trip.service';

describe('ShuttleTripService', () => {
  let service: ShuttleTripService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShuttleTripService],
    }).compile();

    service = module.get<ShuttleTripService>(ShuttleTripService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
