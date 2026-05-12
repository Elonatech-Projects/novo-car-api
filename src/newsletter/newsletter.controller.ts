// newsletter.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Throttle({ default: { ttl: 60_000, limit: 3 } }) // Limit to 5 requests per minute per IP
  @Post('subscribe')
  async subscribe(@Body() dto: CreateNewsletterDto) {
    return this.newsletterService.subscribe(dto);
  }
}
