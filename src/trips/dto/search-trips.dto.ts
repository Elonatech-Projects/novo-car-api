// trips/dto/search-trips.dto.ts
import { Transform } from 'class-transformer';
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
  shuttleType?: string = 'all';

  @IsString()
  @IsNotEmpty()
  travelDate: string;

  @IsOptional()
  @Transform(({ value }) => value || '1')
  @IsNumberString()
  passengers?: string = '1';
}
