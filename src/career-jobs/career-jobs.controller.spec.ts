import { Test, TestingModule } from '@nestjs/testing';
import { CareerJobsController } from './career-jobs.controller';

describe('CareerJobsController', () => {
  let controller: CareerJobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareerJobsController],
    }).compile();

    controller = module.get<CareerJobsController>(CareerJobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
