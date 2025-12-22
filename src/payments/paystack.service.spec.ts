import { Test } from '@nestjs/testing';
import { PaystackService } from './paystack.service';
import { ConfigService } from '@nestjs/config';

describe('PaystackService', () => {
  let service: PaystackService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PaystackService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test_key'),
          },
        },
      ],
    }).compile();

    service = module.get(PaystackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
