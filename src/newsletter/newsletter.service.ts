// newsletter.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from './entities/newsletter.entity';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name)
    private readonly newsletterModel: Model<NewsletterDocument>,
  ) {}

  async subscribe(dto: CreateNewsletterDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.newsletterModel.findOne({ email });

    if (existing) {
      throw new ConflictException('Email already subscribed');
    }

    await this.newsletterModel.create({ email });

    return { message: 'Subscription successful' };
  }
}
