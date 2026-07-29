import { Module } from '@nestjs/common';
import { VerificationServicesService } from './verification-services.service';
import { VerificationServicesController } from './verification-services.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VerificationService,
  VerificationServiceSchema,
} from './schema/verification-services.schema';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuditModule,
    MongooseModule.forFeature([
      {
        name: VerificationService.name,
        schema: VerificationServiceSchema,
      },
    ]),
  ],
  providers: [VerificationServicesService, MailService, ConfigService],
  controllers: [VerificationServicesController],
})
export class VerificationServicesModule {}
