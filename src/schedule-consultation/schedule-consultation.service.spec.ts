import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleConsultationService } from './schedule-consultation.service';

describe('ScheduleConsultationService', () => {
  let service: ScheduleConsultationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleConsultationService],
    }).compile();

    service = module.get<ScheduleConsultationService>(ScheduleConsultationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
