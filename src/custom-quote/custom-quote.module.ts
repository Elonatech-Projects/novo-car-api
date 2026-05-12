import { Module } from '@nestjs/common';
import { CustomQuoteService } from './custom-quote.service';
import { CustomQuoteController } from './custom-quote.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomQuote, CustomQuoteSchema } from './schema/custom-quote.schema';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: CustomQuote.name, schema: CustomQuoteSchema },
    ]),
  ],
  controllers: [CustomQuoteController],
  providers: [CustomQuoteService, MailService],
})
export class CustomQuoteModule {}
