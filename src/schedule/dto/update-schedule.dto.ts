import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { WeekDay } from '../../common/utils/get-weekday.util';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  departureTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  operatingDays?: WeekDay[];
}
