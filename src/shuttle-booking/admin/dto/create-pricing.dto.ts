// admin/dto/create-pricing.dto.ts
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ShuttleType } from '../../enums';

export class CreatePricingDto {
  @IsEnum(ShuttleType)
  shuttleType: ShuttleType;

  @IsNumber()
  @Min(0)
  baseFare: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perKmRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perExtraPassenger?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perExtraCar?: number;

  @IsOptional()
  @IsNumber()
  trafficMultiplier?: number;
}
