// dto/update-booking-request.dto.ts

import { IsEnum, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingRequestDto } from './create-booking-request.dto';

export enum BookingRequestStatusEnum {
  PENDING_REVIEW = 'pending_review',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  REJECTED = 'rejected',
}

export class UpdateBookingRequestDto extends PartialType(
  CreateBookingRequestDto,
) {
  @IsOptional()
  @IsEnum(BookingRequestStatusEnum)
  status?: BookingRequestStatusEnum;
}
