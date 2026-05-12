import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingRequestDto } from './create-booking-request.dto';

export class UpdateBookingRequestDto extends PartialType(CreateBookingRequestDto) {}
