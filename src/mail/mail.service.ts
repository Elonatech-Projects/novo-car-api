import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  private compileTemplate(
    filePath: string,
    context: Record<string, unknown>,
  ): string {
    const templateFile = fs.readFileSync(filePath, 'utf8');
    const compiled = Handlebars.compile(templateFile);
    return compiled(context);
  }

  async sendTemplateEmail(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<void> {
    try {
      const templatesDir = path.join(
        process.cwd(),
        'src',
        'mail',
        'templates',
      );

      // 1️⃣ Compile body
      const bodyPath = path.join(templatesDir, `${templateName}.hbs`);
      const bodyHtml = this.compileTemplate(bodyPath, {
        ...context,
        year: new Date().getFullYear(),
      });

      // 2️⃣ Compile layout and inject body
      const layoutPath = path.join(
        templatesDir,
        'layouts',
        'layout.hbs',
      );

      const finalHtml = this.compileTemplate(layoutPath, {
        body: bodyHtml,
        year: new Date().getFullYear(),
      });

      // 3️⃣ Send email using raw HTML
      await this.mailerService.sendMail({
        to,
        subject,
        html: finalHtml,
      });

      this.logger.log(`Email sent: ${templateName} → ${to}`);
    } catch (error) {
      this.logger.error(`Email failed: ${templateName}`, error);
    }
  }
}
