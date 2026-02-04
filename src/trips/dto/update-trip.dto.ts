// trips/dto/update-trip.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTripDto } from './create-trip.dto';

/**
 * Partial update DTO for trips.
 * All fields from CreateTripDto are optional here.
 */
export class UpdateTripDto extends PartialType(CreateTripDto) {}
