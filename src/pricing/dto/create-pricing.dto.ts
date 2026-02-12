import { IsEnum, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ShuttleType } from '../../shuttle-booking/enums';
export class CreatePricingDto {
  @IsEnum(ShuttleType)
  shuttleType: ShuttleType;

  @IsNumber()
  @Min(0)
  baseFare: number;

  @IsOptional()
  @IsNumber()
  perKmRate?: number;

  @IsOptional()
  @IsNumber()
  freeKm?: number;

  @IsOptional()
  @IsNumber()
  perExtraPassenger?: number;

  @IsOptional()
  @IsNumber()
  perExtraCar?: number;

  @IsOptional()
  @IsNumber()
  trafficMultiplier?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
