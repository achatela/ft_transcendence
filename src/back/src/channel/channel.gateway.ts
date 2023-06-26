import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';


@WebSocketGateway({ cors: "*" })
export class ChannelGateway {
    constructor(private prismaService: PrismaService, private authService: AuthService) { }
    @WebSocketServer()
    server: Server;

    // handleConnection(@ConnectedSocket() client : Socket, @MessageBody() data: {room: string}): void {
    //   client.join(data.room)
    //   console.log(client.id, 'joined', data.room);
    // }

    @SubscribeMessage('joinRoomChannel')
    handleJoinRoomChannel(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string }): void {
        console.log("joinRoomChannel body:\n", body);
        socket.join(body.room);
        socket.on('disconnect', () => {
            socket.leave(body.room);
            console.log(socket.id, 'left', body.room);
        });
        this.server.emit('joinRoomChannel', body.room);
        console.log(socket.id, 'joined', body.room);
    }

    @SubscribeMessage('messageChannel')
    async handleMessageChannel(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string, senderUsername: string, message: string },): Promise<void> {
        console.log("messageChannel body:\n", body);
        const chat = await this.prismaService.channel.findUnique({ where: { channelName: body.room }, include: { messages: true } });
        const sender = await this.prismaService.user.findUnique({ where: { username: body.senderUsername }, select: { id: true } });

        const { messages } = await this.prismaService.channel.update({
            where: {
                channelName: body.room
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
        this.server.emit('messageChannel', { senderId: sender.id, text: body.message, time: messages[0].createdAt, username: user.username, avatar: user.avatar });
        console.log(socket.id, ":", body.message);
    }
}