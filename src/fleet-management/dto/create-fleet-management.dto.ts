// Create Fleet Management DTO
// src\fleet-management\dto\create-fleet-management.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFleetManagementDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() @IsNotEmpty() email!: string;
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @IsNotEmpty() pickup!: string;
  @IsString() @IsNotEmpty() destination!: string;
  @IsString() @IsNotEmpty() date!: string;
  @IsString() @IsNotEmpty() time!: string;
  @IsString() @IsNotEmpty() passengerCount!: string;
  @IsString() @IsOptional() cargoDescription?: string;
  @IsString() @IsOptional() specialRequests?: string;
  @IsString() @IsOptional() vehicleType?: string;
  @IsString() @IsOptional() vehicleId?: string;
  @IsString() @IsOptional() vehicleName?: string;
}
