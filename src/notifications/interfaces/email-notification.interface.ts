// src/notifications/interfaces/email-notification.interface.ts

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  receiptTemplate?: string;
  context: Record<string, unknown>;
  attachments?: {
    filename: string;
    content: Buffer | string;
  }[];
}
