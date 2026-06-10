import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { Newsletter, NewsletterSchema } from './schema/newsletter.schema';
import {
  UnsubscribeRequest,
  UnsubscribeRequestSchema,
} from './schema/unsubscribe-request.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Newsletter.name, schema: NewsletterSchema },
      { name: UnsubscribeRequest.name, schema: UnsubscribeRequestSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
