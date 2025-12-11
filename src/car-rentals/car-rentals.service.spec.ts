import { Test, TestingModule } from '@nestjs/testing';
import { CarRentalsService } from './car-rentals.service';

describe('CarRentalsService', () => {
  let service: CarRentalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarRentalsService],
    }).compile();

    service = module.get<CarRentalsService>(CarRentalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
