import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { PongService } from './pong.service';
import { CreatePongDto } from './dto/create-pong.dto';
import { UpdatePongDto } from './dto/update-pong.dto';
import { Socket } from 'dgram';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway(3130, { cors: true })
export class PongGateway {
  constructor(private pongService: PongService, private prismaService: PrismaService) {
    const io = require('socket.io')(3131, {
      cors: {
        origin: '*',
      }
    }
    );
    // this.pongService.gameStates.push({ id1: 0, id2: 0, x: 0, y: 0, dx: 0, dy: 0, paddleLeft: 0, paddleRight: 0 });
    io.on('connection', (socket) => {
      socket.emit('gameState', {});
      socket.on('connectGameClassic', (data) => {
        this.pongService.changeSocketClassic(data.socketId, data.login);
        console.log("connected to game", data);
      });
      socket.on('moveUp', (data) => {
        console.log("player moved up", data.socketId);
      });
      socket.on('moveDown', (data) => {
        console.log("player moved down", data.socketId);
      });
      socket.on('disconnect', () => {
        console.log("disconnect");
      });
    });
  }

  @SubscribeMessage('connect')
  async handleConnect(@MessageBody() data: string): Promise<string> {
    console.log("connect", data);
    return data;
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    console.log("events 3130", data);
    return data;
  }
}
