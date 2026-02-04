// trips/dto/search-trips.dto.ts
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class SearchTripsDto {
  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropoffLocation: string;

  @IsOptional()
  @IsString()
  shuttleType?: string = 'all';

  @IsString()
  @IsNotEmpty()
  travelDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  passengers?: number = 1;
}
