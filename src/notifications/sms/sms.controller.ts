// src/sms/sms.controller.ts

import { Controller, Get } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get('test')
  async testSMS(): Promise<string> {
    console.log('SMS trigger hit');
    await this.smsService.sendSMS(
      ['07017718494'], // <-- replace with your number
      'Novo: Your verification code is 123456',
    );

    return 'SMS sent (check your phone)';
  }
}
