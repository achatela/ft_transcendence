import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { PongService } from './pong.service';
import { CreatePongDto } from './dto/create-pong.dto';
import { UpdatePongDto } from './dto/update-pong.dto';
import { Socket } from 'dgram';
import { PrismaService } from 'src/prisma/prisma.service';

let roomCounter = 1;

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
      let interval: NodeJS.Timer;
      socket.emit('gameState', {});
      socket.on('connectGameClassic', (data) => {
        this.pongService.changeSocketClassic(data.socketId, data.login);
      });
      socket.on('moveUp', (data) => {
        this.pongService.moveUp(data.socketId);
      });
      socket.on('moveDown', (data) => {
        this.pongService.moveDown(data.socketId);
      });
      socket.on('update', (data) => {
        // need to move the setInterval, so we check before if the player is already in a game
        interval = setInterval(() => {
          const ret = this.pongService.getGameState(data.socketId);
          socket.emit('update', ret);
          // if (ret.success === false) {
          //   clearInterval(interval);
          // }
        }, 16); // 30 fps je crois
        console.log("update", data);
      });
      socket.on('disconnect', (data) => {
        this.pongService.disconnectSocket(data.socketId);
        clearInterval(interval);
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
