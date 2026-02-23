import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShuttleServicesDto {
  @IsMongoId()
  scheduleId: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsNotEmpty()
  travelDate: string; // YYYY-MM-DD

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  seatCount: number;
}
