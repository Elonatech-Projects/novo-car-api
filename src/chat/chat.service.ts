// chat.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.openai = new OpenAI({ apiKey });
  }

  async generateReply(message: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: message },
        ],
      });

      const reply = completion.choices[0]?.message?.content;

      if (!reply) {
        throw new InternalServerErrorException('Empty AI response');
      }

      return reply;
    } catch (error) {
      console.error('OpenAI error:', error);

      throw new InternalServerErrorException('Failed to generate AI response');
    }
  }

  private getSystemPrompt(): string {
    return `
You are the Novo Assistant.

Help users with:
- Shuttle booking
- Airport pickup
- Executive travel

If unsure, collect:
Name, Email, Phone, Message.
`;
  }
}
