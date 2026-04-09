// src/modules/chat/chat.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto, ChatResponseDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() dto: ChatDto): Promise<ChatResponseDto> {
    const reply = await this.chatService.generateReply(dto.message);

    return { reply };
  }
}
