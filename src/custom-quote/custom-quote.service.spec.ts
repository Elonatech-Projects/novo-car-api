import { Test, TestingModule } from '@nestjs/testing';
import { CustomQuoteService } from './custom-quote.service';

describe('CustomQuoteService', () => {
  let service: CustomQuoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomQuoteService],
    }).compile();

    service = module.get<CustomQuoteService>(CustomQuoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
