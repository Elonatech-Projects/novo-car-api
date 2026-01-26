// trips/dto/update-trip.dto.ts (Partial update)
import { PartialType } from '@nestjs/mapped-types';
import { CreateTripDto } from './create-trip.dto';

export class UpdateTripDto extends PartialType(CreateTripDto) {}
// trips/schema/trip.schema.ts
