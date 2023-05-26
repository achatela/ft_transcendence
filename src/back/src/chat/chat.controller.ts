import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from '@prisma/client';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(@Body() chat: {message: string, userId: number}): Promise<Chat> {
    return this.chatService.create(chat);
  }

  @Get()
  async findAll(): Promise<Chat[]> {
    return this.chatService.findAll();
  }
}
