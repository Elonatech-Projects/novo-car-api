// Status-only update DTO for admin PATCH /airport-transfer/:id/status
// src/airport-transfer/dto/update-airport-transfer-status.dto.ts
import { IsIn } from 'class-validator';
import {
  AIRPORT_TRANSFER_STATUSES,
  AirportTransferStatus,
} from '../schema/airport-transfer.schema';

export class UpdateAirportTransferStatusDto {
  @IsIn(AIRPORT_TRANSFER_STATUSES, {
    message: `Status must be one of: ${AIRPORT_TRANSFER_STATUSES.join(', ')}`,
  })
  status!: AirportTransferStatus;
}
