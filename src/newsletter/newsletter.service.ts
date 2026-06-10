import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { Newsletter, NewsletterDocument } from './schema/newsletter.schema';
import {
  UnsubscribeRequest,
  UnsubscribeRequestDocument,
} from './schema/unsubscribe-request.schema';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { CreateUnsubscribeDto } from './dto/create-unsubscribe.dto';
import { UpdateUnsubscribeRequestDto } from './dto/update-request.dto';
import { NotificationService } from '../notifications/notifications.service';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    @InjectModel(Newsletter.name)
    private readonly newsletterModel: Model<NewsletterDocument>,

    @InjectModel(UnsubscribeRequest.name)
    private readonly unsubscribeModel: Model<UnsubscribeRequestDocument>,

    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  // ── Subscribe ────────────────────────────────────────────────────────────────

  async subscribe(dto: CreateNewsletterDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.newsletterModel.findOne({ email });
    if (existing) {
      throw new ConflictException('This email is already subscribed.');
    }

    await this.newsletterModel.create({
      email,
      firstName: dto.firstName?.trim(),
      source: dto.source ?? 'website',
    });

    this.logger.log(
      `New subscriber: ${email} (source: ${dto.source ?? 'website'})`,
    );

    // Notify admin
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (adminEmail) {
      this.notificationService
        .sendEmail({
          to: adminEmail,
          subject: `New Newsletter Subscriber — ${email}`,
          template: 'newsletter-subscribe-admin',
          context: {
            email,
            firstName: dto.firstName ?? 'N/A',
            source: dto.source ?? 'website',
          },
        })
        .catch((err) =>
          this.logger.error('Failed to notify admin of new subscriber', err),
        );
    }

    return { message: 'Subscription successful.' };
  }

  // ── Unsubscribe request ──────────────────────────────────────────────────────

  async requestUnsubscribe(
    dto: CreateUnsubscribeDto,
  ): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();

    // Check for duplicate pending request
    const existing = await this.unsubscribeModel.findOne({
      email,
      status: 'pending',
    });

    if (existing) {
      // Silently succeed — user already has a pending request
      return { message: 'Unsubscribe request already received.' };
    }

    await this.unsubscribeModel.create({
      email,
      reason: dto.reason,
      comments: dto.comments?.trim(),
    });

    this.logger.log(
      `Unsubscribe request from: ${email} (reason: ${dto.reason})`,
    );

    // Notify admin
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (adminEmail) {
      this.notificationService
        .sendEmail({
          to: adminEmail,
          subject: `Unsubscribe Request — ${email}`,
          template: 'newsletter-unsubscribe-admin',
          context: {
            email,
            reason: dto.reason,
            comments: dto.comments ?? 'N/A',
          },
        })
        .catch((err) =>
          this.logger.error(
            'Failed to notify admin of unsubscribe request',
            err,
          ),
        );
    }

    return {
      message:
        'Unsubscribe request received. Our team will process it shortly.',
    };
  }

  // ── Admin: Subscribers ───────────────────────────────────────────────────────

  async getAllSubscribers(): Promise<Newsletter[]> {
    return this.newsletterModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async deleteSubscriber(id: string): Promise<{ message: string }> {
    const deleted = await this.newsletterModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Subscriber not found.');
    }
    this.logger.log(`Deleted subscriber: ${deleted.email}`);
    return { message: 'Subscriber removed.' };
  }

  // ── Admin: Unsubscribe requests ──────────────────────────────────────────────

  async getAllUnsubscribeRequests(): Promise<UnsubscribeRequest[]> {
    return this.unsubscribeModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async updateUnsubscribeRequest(
    id: string,
    dto: UpdateUnsubscribeRequestDto,
  ): Promise<UnsubscribeRequest> {
    const updated = await this.unsubscribeModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Unsubscribe request not found.');
    }
    return updated;
  }

  async deleteUnsubscribeRequest(id: string): Promise<{ message: string }> {
    const deleted = await this.unsubscribeModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException('Unsubscribe request not found.');
    }
    return { message: 'Request deleted.' };
  }
}
