import { IsMongoId, IsNotEmpty } from 'class-validator';

export class InitializePaymentDto {
  @IsMongoId()
  @IsNotEmpty()
  bookingId: string;
}
