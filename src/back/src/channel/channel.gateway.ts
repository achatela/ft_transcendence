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

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string }): void {
        socket.join(body.room);
        socket.on('disconnect', () => {
            socket.leave(body.room);
            console.log(socket.id, 'left', body.room);
        });
        this.server.emit('joinRoom', body.room);
        console.log(socket.id, 'joined', body.room);
    }

    @SubscribeMessage('message')
    async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() body: { room: string, senderUsername: string, message: string },): Promise<void> {

    }
}