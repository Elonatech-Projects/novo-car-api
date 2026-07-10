import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleConsultationController } from './schedule-consultation.controller';
import { ScheduleConsultationService } from './schedule-consultation.service';

describe('ScheduleConsultationController', () => {
  let controller: ScheduleConsultationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleConsultationController],
      providers: [ScheduleConsultationService],
    }).compile();

    controller = module.get<ScheduleConsultationController>(ScheduleConsultationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
