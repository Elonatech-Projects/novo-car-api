import { Test, TestingModule } from '@nestjs/testing';
import { CarRentalsController } from './car-rentals.controller';

describe('CarRentalsController', () => {
  let controller: CarRentalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarRentalsController],
    }).compile();

    controller = module.get<CarRentalsController>(CarRentalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
