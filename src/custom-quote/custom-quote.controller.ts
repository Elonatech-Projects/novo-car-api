import { Body, Controller, Post } from '@nestjs/common';
import { CustomQuoteService } from './custom-quote.service';
import { CreateCustomQuoteDto } from './dto/create-custom-quote.dto';

@Controller('custom-quote')
export class CustomQuoteController {
  constructor(private readonly customQuoteService: CustomQuoteService) {}

  @Post()
  async createCustomQuote(@Body() dto: CreateCustomQuoteDto) {
    return this.customQuoteService.createCustomQuote(dto);
  }
}
