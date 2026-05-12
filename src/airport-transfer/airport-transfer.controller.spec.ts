import { Test, TestingModule } from '@nestjs/testing';
import { AirportTransferController } from './airport-transfer.controller';
import { AirportTransferService } from './airport-transfer.service';

describe('AirportTransferController', () => {
  let controller: AirportTransferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirportTransferController],
      providers: [AirportTransferService],
    }).compile();

    controller = module.get<AirportTransferController>(AirportTransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
