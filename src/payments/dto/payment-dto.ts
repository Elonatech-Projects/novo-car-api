import { IsNotEmpty, IsString } from 'class-validator';

export class InitializePaymentDto {
  @IsString() @IsNotEmpty() email: string;
  @IsString() @IsNotEmpty() amount: number;
  @IsString() @IsNotEmpty() reference: string;
}
