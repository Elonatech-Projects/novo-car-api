import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFleetManagementDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() email: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() pickup: string;
  @IsString() @IsNotEmpty() destination: string;
  @IsString() @IsNotEmpty() date: string;
  @IsString() @IsNotEmpty() time: string;
  @IsString() @IsNotEmpty() passengerCount: string;
  @IsString() @IsNotEmpty() cargoDescription: string;
  @IsString() @IsNotEmpty() specialRequests: string;
  @IsString() @IsOptional() vehicleType: string;
}
