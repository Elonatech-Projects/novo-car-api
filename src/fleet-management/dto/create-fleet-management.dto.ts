import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFleetManagementDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() pickup: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() destination: string;
  @IsString() @IsNotEmpty() date: string;
  @IsString() @IsNotEmpty() notes: string;
}
