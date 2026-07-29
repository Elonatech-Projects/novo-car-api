// Create Career Jobs DTO
// Defines the structure and validation for creating a new career job listing
// src\career-jobs\dto\create-career-jobs.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCareerJobsDto {
  @IsString() @IsNotEmpty() @MinLength(3) header!: string;
  @IsNotEmpty() @IsString() @MinLength(3) location!: string;
  @IsNotEmpty() @IsString() @MinLength(3) type!: string;
  @IsNotEmpty() @IsString() @MinLength(3) category!: string;
  @IsNotEmpty() @IsString() @MinLength(10) shortDescription!: string;
  @IsNotEmpty() @IsString() postedDate!: string;
  @IsNotEmpty() skills!: string | string[];
}
