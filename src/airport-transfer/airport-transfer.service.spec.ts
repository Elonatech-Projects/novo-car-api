import { Test, TestingModule } from '@nestjs/testing';
import { AirportTransferService } from './airport-transfer.service';

describe('AirportTransferService', () => {
  let service: AirportTransferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirportTransferService],
    }).compile();

    service = module.get<AirportTransferService>(AirportTransferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
