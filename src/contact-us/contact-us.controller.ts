import { Body, Controller, Post } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsDto } from './dto/contact-us.dto';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post('create')
  async createContactUs(@Body() dto: ContactUsDto) {
    return this.contactUsService.createContactUs(dto);
  }
}
