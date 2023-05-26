import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Chat } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async create(chat: {message: string, userId: number}): Promise<Chat> {
    return this.prisma.chat.create({
      data: {
        messages: {
          create: {
            text: chat.message,
            user: {
              connect: { id: chat.userId },
            },
          },
        },
      },
    });
  }

  async findAll(): Promise<Chat[]> {
    return this.prisma.chat.findMany({
      include: {
        messages: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
