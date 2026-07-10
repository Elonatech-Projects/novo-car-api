import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleConsultationDto } from './create-schedule-consultation.dto';

export class UpdateScheduleConsultationDto extends PartialType(CreateScheduleConsultationDto) {}
