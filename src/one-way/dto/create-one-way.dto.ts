import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOneWayDto {
  @IsString() @IsNotEmpty() from: string;
  @IsString() @IsNotEmpty() to: string;
  @IsString() @IsNotEmpty() departureDate: string;
}
