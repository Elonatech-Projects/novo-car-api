import { Test, TestingModule } from '@nestjs/testing';

import { JobApplicationsController } from './job-application.controller';
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
});
