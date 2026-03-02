// Mail Module
// src\mail\mail.module.ts
import { Module } from '@nestjs/common';
// import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
// import { join } from 'path';

@Module({
  imports: [ConfigModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
