import { Test, TestingModule } from '@nestjs/testing';
import { VerificationServicesService } from './verification-services.service';
import { getModelToken } from '@nestjs/mongoose';
import { VerificationService } from './schema/verification-services.schema';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { ConflictException } from '@nestjs/common';
import { MongoServerError } from 'mongodb';

describe('VerificationServicesService', () => {
  let service: VerificationServicesService;
  let saveMock: jest.Mock;
  let sendTemplateEmailMock: jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn();
    sendTemplateEmailMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationServicesService,
        {
          provide: getModelToken(VerificationService.name),
          useValue: jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: saveMock,
          })),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('admin@example.com'),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendTemplateEmail: sendTemplateEmailMock,
          },
        },
      ],
    }).compile();

    service = module.get<VerificationServicesService>(VerificationServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create request and send admin email', async () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      serviceType: 'Identity Verification',
      company: 'Acme',
      message: 'Please verify',
    };
    const savedDoc = { _id: 'id-1', ...dto };
    saveMock.mockResolvedValue(savedDoc);

    const result = await service.createVerificationRequest(dto);

    expect(result).toEqual(savedDoc);
    expect(sendTemplateEmailMock).toHaveBeenCalledWith(
      'admin@example.com',
      'New Verification Service Request',
      'verification-service-admin',
      dto,
    );
  });

  it('should throw conflict exception for duplicate key errors', async () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      serviceType: 'Identity Verification',
      company: 'Acme',
      message: 'Please verify',
    };
    const duplicateError = new MongoServerError({
      code: 11000,
      errmsg: 'duplicate key error',
    } as any);
    saveMock.mockRejectedValue(duplicateError);

    await expect(service.createVerificationRequest(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
