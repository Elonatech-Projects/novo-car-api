// Create Career Jobs DTO
// Defines the structure and validation for creating a new career job listing
// src\career-jobs\dto\create-career-jobs.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCareerJobsDto {
  @IsString() @IsNotEmpty() header!: string;
  @IsNotEmpty() @IsString() location!: string;
  @IsNotEmpty() @IsString() type!: string;
  @IsNotEmpty() @IsString() category!: string;
  @IsNotEmpty() @IsString() shortDescription!: string;
  @IsNotEmpty() @IsString() postedDate!: string;
  @IsNotEmpty() skills!: string | string[];
}
