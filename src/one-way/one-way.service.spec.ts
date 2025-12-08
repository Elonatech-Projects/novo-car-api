import { Test, TestingModule } from '@nestjs/testing';
import { OneWayService } from './one-way.service';

describe('OneWayService', () => {
  let service: OneWayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OneWayService],
    }).compile();

    service = module.get<OneWayService>(OneWayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
