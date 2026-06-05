// src/shuttle-services/dto/find-all-shuttle-services.dto.ts
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ShuttleBookingStatus } from '../../common/enums/shuttle-booking.enum';

export class FindAllShuttleServicesDto {
  // ── Trip type filter ────────────────────────────────────────────────────────
  // true  = round-trip bookings only
  // false = one-way bookings only
  // omit  = all bookings
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isRoundTrip?: boolean;

  // ── Status filter ───────────────────────────────────────────────────────────
  @IsOptional()
  @IsEnum(ShuttleBookingStatus)
  status?: ShuttleBookingStatus;

  // ── Seat count filter ───────────────────────────────────────────────────────
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seatCount?: number;

  // ── Travel date filter (YYYY-MM-DD) ─────────────────────────────────────────
  @IsOptional()
  @IsString()
  travelDate?: string;

  // ── Pagination ──────────────────────────────────────────────────────────────
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
