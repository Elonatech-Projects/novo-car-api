import { Test, TestingModule } from '@nestjs/testing';
import { CustomQuoteController } from './custom-quote.controller';
import { CustomQuoteService } from './custom-quote.service';

describe('CustomQuoteController', () => {
  let controller: CustomQuoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomQuoteController],
      providers: [CustomQuoteService],
    }).compile();

    controller = module.get<CustomQuoteController>(CustomQuoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
