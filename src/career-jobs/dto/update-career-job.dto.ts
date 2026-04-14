// Update Career Jobs DTO
import { IsOptional, IsString } from 'class-validator';

export class UpdateCareerJobsDto {
  @IsOptional() @IsString() header?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() postedDate?: string;
  @IsOptional() skills?: string | string[];
}
