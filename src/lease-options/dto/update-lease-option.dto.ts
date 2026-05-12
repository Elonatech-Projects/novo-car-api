import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaseConsultationDto } from './create-lease-option.dto';

export class UpdateLeaseOptionDto extends PartialType(
  CreateLeaseConsultationDto,
) {}
