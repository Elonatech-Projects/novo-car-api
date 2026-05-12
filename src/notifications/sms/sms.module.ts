// SMS Module: src/notifications/sms/sms.module.ts
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [SmsService],
  controllers: [SmsController],
  exports: [SmsService],
})
export class SmsModule {}
