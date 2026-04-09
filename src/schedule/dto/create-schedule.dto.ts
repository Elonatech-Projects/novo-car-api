// Create Schedule
// This DTO defines the structure and validation rules for creating a new shuttle schedule. It includes fields for route code, origin, destination, departure time, capacity, base price, operating days, and optional fields for active status, plate number, and specific dates. The validation decorators ensure that the input data adheres to the expected formats and constraints before it is processed by the service layer.
// src\schedule\dto\create-schedule.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { WeekDay } from '../../common/utils/get-weekday.util';

export class CreateScheduleDto {
  // @IsString()
  // @IsNotEmpty({ message: 'Route code cannot be empty' })
  // code!: string;

  @IsString()
  @IsNotEmpty({ message: 'Origin city (from) is required' })
  from!: string;
  @IsString()
  @IsNotEmpty({ message: 'Destination city (to) is required' })
  to!: string;

  @IsString()
  @IsNotEmpty({ message: 'Departure time is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'departureTime must be in HH:mm format',
  })
  departureTime!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Capacity must be a number' })
  @IsPositive({ message: 'Capacity must be greater than 0' })
  capacity!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Base price must be a number' })
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
