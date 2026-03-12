import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { MailService } from '../mail/mail.service';
import { JobApplication } from './schema/job-application.schema';
import { JobApplicationsService } from './job-application.service';

describe('JobApplicationsService', () => {
  let service: JobApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsService,
        {
          provide: getModelToken(JobApplication.name),
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {
            sendTemplateEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobApplicationsService>(JobApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
