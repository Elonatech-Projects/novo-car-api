import { Test, TestingModule } from '@nestjs/testing';

import {
  isAllowedCvFile,
  JobApplicationsController,
} from './job-application.controller';
import { JobApplicationsService } from './job-application.service';

describe('JobApplicationsController', () => {
  let controller: JobApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobApplicationsController],
      providers: [
        {
          provide: JobApplicationsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobApplicationsController>(JobApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('accepts pdf, doc, and docx files by extension and mime type', () => {
    expect(
      isAllowedCvFile({
        mimetype: 'application/pdf',
        originalname: 'resume.pdf',
      } as Express.Multer.File),
    ).toBe(true);

    expect(
      isAllowedCvFile({
        mimetype: 'application/msword',
        originalname: 'resume.doc',
      } as Express.Multer.File),
    ).toBe(true);

    expect(
      isAllowedCvFile({
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        originalname: 'resume.docx',
      } as Express.Multer.File),
    ).toBe(true);
  });

  it('rejects unsupported extensions even when the mime type is otherwise allowed', () => {
    expect(
      isAllowedCvFile({
        mimetype: 'application/pdf',
        originalname: 'resume.txt',
      } as Express.Multer.File),
    ).toBe(false);
  });
});
