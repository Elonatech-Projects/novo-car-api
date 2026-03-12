import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { WeekDay } from '../../common/utils/get-weekday.util';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty({ message: 'Route code cannot be empty' })
  code!: string;

  @IsString() @IsNotEmpty({ message: 'from cannot be empty' }) from!: string;
  @IsString() @IsNotEmpty({ message: 'to cannot be empty' }) to!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'departureTime must be in HH:mm format',
  })
  departureTime!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  capacity!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], { each: true })
  operatingDays!: WeekDay[];

  @IsBoolean() @IsOptional() isActive?: boolean;

  @IsString() @IsOptional() plateNumber?: string;

  @IsArray() @IsOptional() @IsString({ each: true }) specificDates?: string[];
}
