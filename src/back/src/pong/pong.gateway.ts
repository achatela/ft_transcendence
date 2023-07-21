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
      interval = null;
      socket.emit('gameState', {});
      socket.on('connectGameClassic', (data) => {
        this.pongService.changeSocketClassic(socket.id, data.login, io);
      });
      socket.on('connectGameCustom', (data) => {
        this.pongService.changeSocketCustom(socket.id, data.login, io);
      })
      socket.on('moveUp', (data) => {
        this.pongService.moveUp(socket.id, data.key);
      });
      socket.on('moveDown', (data) => {
        this.pongService.moveDown(socket.id, data.key);
      });
      socket.on('update', (data) => {
        // need to move the setInterval, so we check before if the player is already in a game
        interval = setInterval(() => {
          if (this.pongService.gameStatus(socket.id, io) == 0)
            return;
          const ret = this.pongService.getGameState(socket.id, io);
          socket.emit('update', ret);
        }, 16); // 30 fps je crois
        console.log("update", data);
      });
      socket.on('disconnect', (data) => {
        console.log(socket.id)
        // console.log("disconnectId", data, data.ping, data.transport, data.handshake, data.time, data.skip)
        this.pongService.disconnectSocket(socket.id, io);
        clearInterval(interval);
      });
      // socket.on('disconnect', (data) => {
      //   console.log("disconnect", data)
      //   this.pongService.disconnectSocket(data.socketId, data.username);
      //   clearInterval(interval);
      //   console.log("disconnect");
      // });
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
