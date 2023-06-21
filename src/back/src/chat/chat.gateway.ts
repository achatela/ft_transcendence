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

  // handleConnection(@ConnectedSocket() client : Socket, @MessageBody() data: {room: string}): void {
  //   client.join(data.room)
  //   console.log(client.id, 'joined', data.room);
  // }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string }): void {
    socket.join(body.room);
    console.log()
    this.server.emit('joinRoom', body.room);
    console.log(socket.id, 'joined', body.room);
  }

  @SubscribeMessage('message')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string, senderUsername: string, message: string },): Promise<void> {
    console.log("in handleMessage")
    const chat = await this.prismaService.friendChat.findUnique({ where: { room: body.room }, include: { messages: true } });
    const sender = await this.prismaService.user.findUnique({ where: { username: body.senderUsername }, select: { id: true } });

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
    console.log(socket.id, ":", body.message);
  }
}