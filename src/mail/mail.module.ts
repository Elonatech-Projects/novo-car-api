// Mail Module
// src\mail\mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('MAIL_HOST');
        const port = Number(configService.get<string>('MAIL_PORT'));
        const secure = configService.get<string>('MAIL_SECURE') === 'true';
        const user = configService.get<string>('MAIL_USER');
        const pass = configService.get<string>('MAIL_PASS');
        const from = configService.get<string>('MAIL_FROM');

        if (!host || !port || !user || !pass || !from) {
          throw new Error(
            'Mail configuration is missing in environment variables.',
          );
        }

        return {
          transport: {
            host,
            port,
            secure,
            auth: { user, pass },
          },
          tls: {
            rejectUnauthorized: false,
          },
          defaults: {
            from: `"Novo Cars" <${from}>`,
          },
          template: {
            dir: join(process.cwd(), 'src/mail/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
