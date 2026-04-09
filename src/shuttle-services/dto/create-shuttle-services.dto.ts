// src\shuttle-services\dto\create-shuttle-services.dto.ts
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  // IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Passenger ────────────────────────────────────────────────────────────────

export class ShuttlePassengerDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^(\+234|0)[789][01]\d{8}$/, {
    message: 'Phone must be a valid Nigerian number (e.g. 08012345678)',
  })
  phone!: string;

  @IsBoolean()
  isPrimary!: boolean;
}

// ─── Schedule sub-DTO ─────────────────────────────────────────────────────────

class ScheduleInputDto {
  @IsMongoId({ message: 'Outbound schedule ID must be a valid MongoDB ID' })
  outbound!: string;

  // Only required (and validated) when the parent DTO has isRoundTrip: true.
  // @IsOptional alone won't cut it for conditional presence — we use @ValidateIf.
  @ValidateIf((dto: CreateShuttleServicesDto) => dto.isRoundTrip === true)
  @IsMongoId({ message: 'Return schedule ID must be a valid MongoDB ID' })
  return?: string;
}

// ─── Main booking DTO ─────────────────────────────────────────────────────────

export class CreateShuttleServicesDto {
  @ValidateNested()
  @Type(() => ScheduleInputDto)
  schedule!: ScheduleInputDto;

  @IsBoolean()
  isRoundTrip!: boolean;

  @IsNotEmpty()
  @IsDateString({}, { message: 'Travel date must be a valid date string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Travel date must be in YYYY-MM-DD format',
  })
  travelDate!: string;

  // returnDate is required when isRoundTrip is true, absent otherwise.
  // Using @ValidateIf instead of @IsOptional prevents an empty string ""
  // from slipping past @IsDateString (class-validator treats "" as present).
  @ValidateIf((dto: CreateShuttleServicesDto) => dto.isRoundTrip === true)
  @IsNotEmpty({ message: 'Return date is required for round-trip bookings' })
  @IsDateString({}, { message: 'Return date must be a valid date string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Return date must be in YYYY-MM-DD format',
  })
  returnDate?: string;

  // Use @IsNumber with @Type rather than relying on implicit coercion.
  // class-transformer needs enableImplicitConversion: false (default) —
  // @Type(() => Number) makes this explicit and safe.
  @Type(() => Number)
  @IsNumber({}, { message: 'Seat count must be a number' })
  @Min(1, { message: 'At least 1 seat must be booked' })
  seatCount!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShuttlePassengerDto)
  passengers!: ShuttlePassengerDto[];
}
