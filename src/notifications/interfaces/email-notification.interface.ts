// src/notifications/interfaces/email-notification.interface.ts

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
  attachments?: EmailAttachment[];
}
