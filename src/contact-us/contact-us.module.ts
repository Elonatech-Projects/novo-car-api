import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactUs, ContactUsSchema } from './schema/contact-us.schema';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';
import { MailService } from '../mail/mail.service';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: ContactUs.name, schema: ContactUsSchema },
    ]),
  ],
  controllers: [ContactUsController],
  providers: [ContactUsService, MailService],
})
export class ContactUsModule {}
