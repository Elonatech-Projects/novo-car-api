import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { NotificationService } from '../notifications/notifications.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { JobApplication } from './schema/job-application.schema';
import { JobApplicationsService } from './job-application.service';

describe('JobApplicationsService', () => {
  let service: JobApplicationsService;
  let saveMock: jest.Mock;
  let uploadFileMock: jest.Mock;
  let sendEmailMock: jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn();
    uploadFileMock = jest.fn();
    sendEmailMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsService,
        {
          provide: getModelToken(JobApplication.name),
          useValue: jest.fn().mockImplementation((data: unknown) => ({
            ...data,
            save: saveMock,
          })),
        },
        {
          provide: NotificationService,
          useValue: {
            sendEmail: sendEmailMock,
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadFile: uploadFileMock,
          },
        },
      ],
    }).compile();

    service = module.get<JobApplicationsService>(JobApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save a CV URL when no file is uploaded', async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com';
    saveMock.mockResolvedValue({ id: 'app-1' });

    const dto = {
      jobId: 'job-1',
      jobTitle: 'Developer',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phoneNumber: '12345678',
      address: 'Lagos',
      cvUrl: 'https://example.com/cv.pdf',
    };

    const result = await service.create(dto as any, undefined);

    expect(result).toEqual({ id: 'app-1' });
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cvUrl: dto.cvUrl,
        cvFileName: 'cv.pdf',
      }),
    );
  });
});
