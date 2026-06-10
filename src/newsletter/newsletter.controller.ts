// newsletter.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { CreateUnsubscribeDto } from './dto/create-unsubscribe.dto';
import { UpdateUnsubscribeRequestDto } from './dto/update-request.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  // ── Public ───────────────────────────────────────────────────────────────────

  /** Homepage subscribe (email only) AND popup subscribe (firstName + email) */
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('subscribe')
  subscribe(@Body() dto: CreateNewsletterDto) {
    return this.service.subscribe(dto);
  }

  /** Unsubscribe request form */
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('unsubscribe')
  requestUnsubscribe(@Body() dto: CreateUnsubscribeDto) {
    return this.service.requestUnsubscribe(dto);
  }

  // ── Admin: Subscribers ───────────────────────────────────────────────────────

  @UseGuards(JwtAdminGuard)
  @Get('subscribers')
  getAllSubscribers() {
    return this.service.getAllSubscribers();
  }

  @UseGuards(JwtAdminGuard)
  @Delete('subscribers/:id')
  deleteSubscriber(@Param('id') id: string) {
    return this.service.deleteSubscriber(id);
  }

  // ── Admin: Unsubscribe requests ──────────────────────────────────────────────

  @UseGuards(JwtAdminGuard)
  @Get('unsubscribe-requests')
  getAllUnsubscribeRequests() {
    return this.service.getAllUnsubscribeRequests();
  }

  @UseGuards(JwtAdminGuard)
  @Patch('unsubscribe-requests/:id')
  updateUnsubscribeRequest(
    @Param('id') id: string,
    @Body() dto: UpdateUnsubscribeRequestDto,
  ) {
    return this.service.updateUnsubscribeRequest(id, dto);
  }

  @UseGuards(JwtAdminGuard)
  @Delete('unsubscribe-requests/:id')
  deleteUnsubscribeRequest(@Param('id') id: string) {
    return this.service.deleteUnsubscribeRequest(id);
  }
}
