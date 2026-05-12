// Mail Service
// src\mail\mail.service.ts
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { BookingRequest } from '../booking-request/entities/booking-request.entity';

interface BrevoEmailPayload {
  sender: {
    email: string;
    name: string;
  };
  to: Array<{ email: string }>;
  subject: string;
  htmlContent: string;
  attachment?: Array<{ name: string; content: string }>;
}

interface BrevoErrorResponse {
  message?: string;
  code?: string;
}

interface TemplateEmailAttachment {
  filename: string;
  content: Buffer | string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL');

    if (!apiKey || !senderEmail) {
      throw new Error(
        'Brevo configuration missing: BREVO_API_KEY or BREVO_SENDER_EMAIL',
      );
    }

    this.apiKey = apiKey;
    this.senderEmail = senderEmail;

    // Register Handlebars helpers
    Handlebars.registerHelper('capitalize', (value) => {
      if (!value || typeof value !== 'string') return '';
      return value.charAt(0).toUpperCase() + value.slice(1);
    });

    Handlebars.registerHelper('formatDate', (date: string) => {
      if (!date) return '-';
      const d = new Date(date);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });

    Handlebars.registerHelper(
      'default',
      (value: unknown, fallback: unknown) => {
        if (value === undefined || value === null || value === '') {
          return typeof fallback === 'string' && fallback.length > 0
            ? fallback
            : '-';
        }

        if (typeof value === 'string') {
          return value;
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
          return String(value);
        }

        return '-';
      },
    );
  }

  private compileTemplate(
    filePath: string,
    context: Record<string, unknown>,
  ): string {
    if (!fs.existsSync(filePath)) {
      throw new InternalServerErrorException(
        `Email template not found: ${filePath}`,
      );
    }

    const templateFile = fs.readFileSync(filePath, 'utf8');
    const compiled = Handlebars.compile(templateFile);
    return compiled(context);
  }

  async sendTemplateEmail(
    to: string | string[],
    subject: string,
    templateName: string,
    context: Record<string, unknown>,
    attachments?: TemplateEmailAttachment[],
  ): Promise<void> {
    // Normalize `to` to always be an array
    // const emailAddresses = Array.isArray(to) ? to : [to];
    const toDisplay = Array.isArray(to) ? to.join(', ') : to;

    try {
      const templatesDir = path.join(process.cwd(), 'src', 'mail', 'templates');

      const bodyPath = path.join(templatesDir, `${templateName}.hbs`);
      const layoutPath = path.join(templatesDir, 'layouts', 'layout.hbs');

      const bodyHtml = this.compileTemplate(bodyPath, {
        ...context,
        year: new Date().getFullYear(),
      });

      const finalHtml = this.compileTemplate(layoutPath, {
        body: bodyHtml,
        year: new Date().getFullYear(),
      });

      const payload: BrevoEmailPayload = {
        sender: {
          email: this.senderEmail,
          name: 'Novo Cars',
        },
        to: Array.isArray(to)
          ? to.map((email) => ({ email }))
          : [{ email: to }],
        subject,
        htmlContent: finalHtml,
        attachment: attachments?.length
          ? attachments.map((file) => ({
              name: file.filename,
              content: Buffer.isBuffer(file.content)
                ? file.content.toString('base64')
                : Buffer.from(file.content).toString('base64'),
            }))
          : undefined,
      };

      await axios.post<void>('https://api.brevo.com/v3/smtp/email', payload, {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10s fail-fast
      });

      this.logger.log(
        `Email sent ? ${templateName} ? ${
          Array.isArray(to) ? to.join(', ') : to
        }`,
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<BrevoErrorResponse>;

        const brevoMessage =
          axiosError.response?.data?.message ?? axiosError.message;

        this.logger.error(
          `Brevo API error ? ${templateName} ? ${toDisplay}`,
          brevoMessage,
        );

        throw new InternalServerErrorException(
          'Failed to send transactional email',
        );
      }

      if (error instanceof Error) {
        this.logger.error(
          `Unexpected mail error ? ${templateName} ? ${toDisplay}`,
          error.message,
        );
      } else {
        this.logger.error(
          `Unknown mail failure ? ${templateName} ? ${toDisplay}`,
          JSON.stringify(error),
        );
      }

      throw new InternalServerErrorException(
        'Unexpected email processing failure',
      );
    }
  }

  // mail.service.ts

  sendBookingRequestToAdmin(booking: BookingRequest): void {
    // temporary stub
    console.log('Admin email:', booking);
  }

  sendBookingAcknowledgement(booking: BookingRequest): void {
    console.log('User email:', booking);
  }
}
