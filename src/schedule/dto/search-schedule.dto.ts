import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchScheduleDto {
  @IsString() @IsNotEmpty() from!: string;
  @IsString() @IsNotEmpty() to!: string;
  @IsString() @IsNotEmpty() departureDate!: string;
  @IsString() @IsOptional() returnDate?: string;
}
