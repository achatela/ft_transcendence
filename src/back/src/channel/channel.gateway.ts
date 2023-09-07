import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

require('events').EventEmitter.prototype._maxListeners = 20;

@WebSocketGateway({ cors: "*" })
export class ChannelGateway {
    constructor(private prismaService: PrismaService, private authService: AuthService) { }
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('joinRoomChannel')
    handleJoinRoomChannel(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string }): void {
        socket.join(body.room);
        socket.on('disconnect', () => {
            socket.leave(body.room);
        });
        this.server.emit('joinRoomChannel', body.room);
    }

    @SubscribeMessage('messageChannel')
    async handleMessageChannel(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string, senderUsername: string, message: string },): Promise<void> {
        const chat = await this.prismaService.channel.findUnique({ where: { channelName: body.room }, select: { messages: true, mutedIds: true, bannedIds: true, users: true } });
        const sender = await this.prismaService.user.findUnique({ where: { username: body.senderUsername }, select: { id: true } });

        if (chat.mutedIds.includes(sender.id)) {
            return;
        }
        else if (chat.bannedIds.includes(sender.id)) {
            return;
        }
        else if (!chat.users.includes(sender.id)) {
            return;
        }
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
    }

    @SubscribeMessage('inviteClassic')
    async handleInviteClassic(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string, username: string, targetUsername: string }): Promise<void> {
        this.server.emit('receiveInviteClassic', { fromUsername: body.username, toUsername: body.targetUsername });
    }

    @SubscribeMessage('acceptClassic')
    async acceptClassic(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string, username: string, targetUsername: string }): Promise<void> {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username }, select: { id: true } });
        const targetUser = await this.prismaService.user.findUnique({ where: { username: body.targetUsername }, select: { id: true } });

        this.server.emit('receiveAcceptClassic', { fromUsername: body.username, toUsername: body.targetUsername, fromId: user.id, toId: targetUser.id });
    }

    @SubscribeMessage('pollKick')
    async pollKick(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string, username: string }): Promise<void> {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        const channel = await this.prismaService.channel.findUnique({ where: { channelName: body.room }, select: { users: true } });

        if (!channel || !channel.users.includes(user.id)) {
            this.server.emit('receivePollKick', { username: body.username });
        }
        return;
    }
}