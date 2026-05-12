import { Test, TestingModule } from '@nestjs/testing';
import { FleetvehicleService } from './fleetvehicle.service';

describe('FleetvehicleService', () => {
  let service: FleetvehicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FleetvehicleService],
    }).compile();

    service = module.get<FleetvehicleService>(FleetvehicleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
