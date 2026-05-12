import { Test, TestingModule } from '@nestjs/testing';
import { FleetvehicleController } from './fleetvehicle.controller';
import { FleetvehicleService } from './fleetvehicle.service';

describe('FleetvehicleController', () => {
  let controller: FleetvehicleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FleetvehicleController],
      providers: [FleetvehicleService],
    }).compile();

    controller = module.get<FleetvehicleController>(FleetvehicleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
