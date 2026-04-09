// Search Schedule
// This DTO defines the structure and validation rules for searching shuttle schedules based on origin, destination, departure date, and an optional return date. The validation decorators ensure that the input data adheres to the expected formats and constraints before it is processed by the service layer. This allows users to find available shuttle schedules that match their travel criteria.
// src\schedule\dto\search-schedule.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchScheduleDto {
  @IsString() @IsNotEmpty() from!: string;
  @IsString() @IsNotEmpty() to!: string;
  @IsString() @IsNotEmpty() departureDate!: string;
  @IsString() @IsOptional() returnDate?: string;
}
