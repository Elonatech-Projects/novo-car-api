import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WeekDay } from '../../common/utils/get-weekday.util';
import { SchedulePlanDto } from './create-schedule.dto';

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

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  vehicle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleImages?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchedulePlanDto)
  plans?: SchedulePlanDto[];
}
