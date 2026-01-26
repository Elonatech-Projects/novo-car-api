// trips/dto/search-trips.dto.ts
import {
  IsOptional,
  IsString,
  IsNumberString,
  IsNotEmpty,
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
  shuttleType?: string;

  @IsString()
  @IsNotEmpty()
  travelDate: string;

  @IsOptional()
  @IsNumberString()
  passengers?: string;
}
