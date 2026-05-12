import { Test, TestingModule } from '@nestjs/testing';
import { LeaseOptionsController } from './lease-options.controller';
import { LeaseOptionsService } from './lease-options.service';

describe('LeaseOptionsController', () => {
  let controller: LeaseOptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaseOptionsController],
      providers: [LeaseOptionsService],
    }).compile();

    controller = module.get<LeaseOptionsController>(LeaseOptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
