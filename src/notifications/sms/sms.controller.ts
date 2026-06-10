// src/sms/sms.controller.ts

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { JwtAdminGuard } from '../../admin/guards/jwt-auth.guard';

interface TestSmsDto {
  phone: string;
  message?: string;
  sender?: string;
}

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  // POST /sms/test  — admin only
  // Body: { "phone": "08012345678", "message": "optional", "sender": "optional" }
  @Post('test')
  @UseGuards(JwtAdminGuard)
  async testSMS(@Body() body: TestSmsDto): Promise<object> {
    const { phone, message, sender } = body;

    const result = await this.smsService.testSend(phone, message, sender);
    return result;
  }
}
