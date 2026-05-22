// src/sms/sms.controller.ts

import { Controller, Post } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  async testSMS(): Promise<string> {
    console.log('SMS trigger hit');
    await this.smsService.sendSMS(
      ['2347017718494'], // international format — no leading +
      'Hello this is a messge sent by Novo Cars',
    );

    return 'SMS sent (check your phone)';
  }
}
