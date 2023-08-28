import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { PongService } from './pong.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: '*' })
export class PongGateway {
  constructor(private pongService: PongService, private prismaService: PrismaService) { }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('connectGameClassic')
  handleConnectGameClassic(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    this.pongService.changeSocketClassic(socket.id, data.login, this.server);
  }

  @SubscribeMessage('connectGameCustom')
  handleConnectGameCustom(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    this.pongService.changeSocketCustom(socket.id, data.login, this.server);
  }

  @SubscribeMessage('moveUp')
  handleMoveUp(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    this.pongService.moveUp(socket.id, data.key);
  }

  @SubscribeMessage('moveDown')
  handleMoveDown(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    this.pongService.moveDown(socket.id, data.key);
  }

  @SubscribeMessage('update')
  handleUpdate(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    setInterval(() => {
      if (this.pongService.gameStatus(socket.id, this.server) == 0)
        return;
      const ret = this.pongService.getGameState(socket.id, this.server);
      socket.emit('update', ret);
    }, 16);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    this.pongService.disconnectSocket(socket.id, this.server);
  }
}
