import { IsIn, IsString } from 'class-validator';

export class UpdateUnsubscribeRequestDto {
  @IsString()
  @IsIn(['pending', 'processed'])
  status: 'pending' | 'processed';
}
