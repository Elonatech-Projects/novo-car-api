import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly sender: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('TERMII_API_KEY');
    const sender = this.configService.get<string>('TERMII_SENDER_ID');

    if (!apiKey || !sender) {
      throw new Error('Termii configuration missing');
    }

    this.apiKey = apiKey;
    this.sender = sender;
  }

  async sendSMS(to: string[], message: string): Promise<void> {
    try {
      await axios.post('https://api.termii.com/api/sms/send', {
        to: to.join(','),
        from: this.sender,
        sms: message,
        type: 'plain',
        channel: 'dnd',
        api_key: this.apiKey,
      });

      this.logger.log(`SMS sent to ${to.join(', ')}`);
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${to.join(', ')}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('SMS sending failed');
    }
  }
}
