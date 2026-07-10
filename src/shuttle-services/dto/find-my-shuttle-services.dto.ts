// src/shuttle-services/dto/find-my-shuttle-services.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { ShuttleBookingStatus } from '../../common/enums/shuttle-booking.enum';

export class FindMyShuttleServicesDto {
  // e.g. ?status=paid to show only confirmed trips.
  @IsOptional()
  @IsEnum(ShuttleBookingStatus)
  status?: ShuttleBookingStatus;
}
