import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';


@WebSocketGateway({ cors: "*" })
export class ChatGateway {
  constructor(private prismaService: PrismaService, private authService: AuthService) { }
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string }): void {
    socket.join(body.room);
    socket.on('disconnect', () => {
      socket.leave(body.room);
    });
    this.server.emit('joinRoom', body.room);
  }

  @SubscribeMessage('message')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string, senderUsername: string, message: string, receiverUsername: string },): Promise<void> {
    const chat = await this.prismaService.friendChat.findUnique({ where: { room: body.room }, include: { messages: true } });
    const sender = await this.prismaService.user.findUnique({ where: { username: body.senderUsername } });
    const receiver = await this.prismaService.user.findUnique({ where: { username: body.receiverUsername } });

    if (receiver.blockedIds.includes(sender.id) || sender.blockedIds.includes(receiver.id)) {
      return;
    }

    if (body.message.length === 0) {
      return;
    }
    const { messages } = await this.prismaService.friendChat.update({
      where: {
        room: body.room
      },
      data: {
        messages: {
          create: {
            senderId: sender.id,
            text: body.message
          }
        }
      },
      include: {
        messages: {
          where: {
            senderId: sender.id,
            text: body.message
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
    let user = await this.prismaService.user.findUnique({ where: { id: sender.id }, select: { username: true, avatar: true } });
    this.server.emit('message', { senderId: sender.id, text: body.message, time: messages[0].createdAt, username: user.username, avatar: user.avatar });
  }
}