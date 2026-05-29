import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

// Termii SMS API response shape (success case)
interface TermiiSmsResponse {
  message_id?: string;
  message?: string;
  balance?: number;
  user?: string;
}

// Termii error response shape
interface TermiiErrorResponse {
  message?: string;
  code?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly sender: string;
  // 'generic' works for all accounts; 'dnd' requires Termii DND-bypass approval
  private readonly channel: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('TERMII_API_KEY');
    const sender = this.configService.get<string>('TERMII_SENDER_ID');

    if (!apiKey || !sender) {
      throw new Error('Termii configuration missing');
    }

    this.apiKey = apiKey;
    this.sender = sender;
    // Default to 'generic' — set TERMII_CHANNEL=dnd in .env only if your
    // Termii account has been approved for DND bypass
    this.channel =
      this.configService.get<string>('TERMII_CHANNEL') ?? 'generic';
  }

  // ─── Phone number normalisation ───────────────────────────────────────────
  // Termii requires international format WITHOUT the leading +
  // e.g.  07017718494  →  2347017718494
  //       +2347017718494  →  2347017718494
  private normaliseNigerianNumber(raw: string): string {
    const digits = raw.replace(/\D/g, ''); // strip all non-digits

    if (digits.startsWith('234')) return digits; // already international
    if (digits.startsWith('0') && digits.length === 11)
      // local format 0XXXXXXXXXX
      return '234' + digits.slice(1);

    // Already stripped of leading + or other prefix — return as-is
    return digits;
  }

  async sendSMS(
    to: string[],
    message: string,
    // Optional — pass a registered Termii sender name to override the default.
    // e.g. 'Novo' for company-facing alerts, 'NovoNG' (default) for passengers.
    senderOverride?: string,
  ): Promise<void> {
    const normalisedNumbers = to.map((n) => this.normaliseNigerianNumber(n));
    const sender = senderOverride ?? this.sender;

    try {
      const response = await axios.post<TermiiSmsResponse>(
        'https://v3.api.termii.com/api/sms/send',
        {
          // Single recipient → plain string; multiple → comma-joined string
          to:
            normalisedNumbers.length === 1
              ? normalisedNumbers[0]
              : normalisedNumbers.join(','),
          from: sender,
          sms: message,
          type: 'plain',
          channel: this.channel,
          api_key: this.apiKey,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10_000, // 10 s fail-fast
        },
      );

      this.logger.log(
        `SMS sent to ${normalisedNumbers.join(', ')} — messageId: ${response.data.message_id ?? 'n/a'}`,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<TermiiErrorResponse>;
        // Log the actual Termii response body so we can diagnose the real reason
        const termiiMessage =
          axiosErr.response?.data?.message ?? axiosErr.message;
        const statusCode = axiosErr.response?.status ?? 'no status';
        const responseBody = JSON.stringify(axiosErr.response?.data ?? {});

        this.logger.error(
          `Termii ${statusCode} sending SMS to ${normalisedNumbers.join(', ')}: ${termiiMessage} | body: ${responseBody}`,
        );
      } else {
        this.logger.error(
          `Unexpected SMS error to ${normalisedNumbers.join(', ')}`,
          error instanceof Error ? error.stack : String(error),
        );
      }

      throw new InternalServerErrorException('SMS sending failed');
    }
  }

  // ─── Test helper ──────────────────────────────────────────────────────────
  // Called by SmsController POST /sms/test — useful for verifying a sender ID
  // is approved and the API key is valid before wiring into real flows.
  async testSend(
    phone: string,
    message = 'Hello from Novo Cars. This is a test message.',
    senderOverride?: string,
  ): Promise<{
    success: boolean;
    to: string;
    sender: string;
    message: string;
  }> {
    const normalisedPhone = this.normaliseNigerianNumber(phone);
    const sender = senderOverride ?? this.sender;

    await this.sendSMS([normalisedPhone], message, senderOverride);

    return {
      success: true,
      to: normalisedPhone,
      sender,
      message,
    };
  }
}
