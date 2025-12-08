import { Test, TestingModule } from '@nestjs/testing';
import { RoundTripService } from './round-trip.service';

describe('RoundTripService', () => {
  let service: RoundTripService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoundTripService],
    }).compile();

    service = module.get<RoundTripService>(RoundTripService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
