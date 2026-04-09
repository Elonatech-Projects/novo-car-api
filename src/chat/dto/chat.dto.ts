// src/modules/chat/dto/chat.dto.ts

import { IsString, MinLength } from 'class-validator';

export class ChatDto {
  @IsString()
  @MinLength(1)
  message!: string;
}

export interface ChatResponseDto {
  reply: string;
}
