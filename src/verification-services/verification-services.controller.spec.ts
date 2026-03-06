import { Test, TestingModule } from '@nestjs/testing';
import { VerificationServicesController } from './verification-services.controller';
import { VerificationServicesService } from './verification-services.service';
import { CreateVerificationServicesDto } from './dto/verification-services.dto';

describe('VerificationServicesController', () => {
  let controller: VerificationServicesController;
  let service: { createVerificationRequest: jest.Mock };

  beforeEach(async () => {
    service = {
      createVerificationRequest: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationServicesController],
      providers: [
        {
          provide: VerificationServicesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<VerificationServicesController>(
      VerificationServicesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass dto to service createVerificationRequest', async () => {
    const dto: CreateVerificationServicesDto = {
      name: 'Test User',
      email: 'test@example.com',
      serviceType: 'Identity Verification',
      company: 'Acme',
      message: 'Please verify',
    };

    service.createVerificationRequest.mockResolvedValue(dto);

    await controller.createVerificationRequest(dto);

    expect(service.createVerificationRequest).toHaveBeenCalledWith(dto);
  });
});
