import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

export class RequestRefundDto {
  @IsEnum(['booking', 'shuttle-booking'])
  source: 'booking' | 'shuttle-booking';

  @IsMongoId()
  sourceId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
