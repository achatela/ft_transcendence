import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { PongService } from './pong.service';
import { CreatePongDto } from './dto/create-pong.dto';
import { UpdatePongDto } from './dto/update-pong.dto';

@WebSocketGateway(3131, { cors: true })
export class PongGateway {
  constructor(private readonly pongService: PongService) { }

  @SubscribeMessage('connect')
  async handleConnect(@MessageBody() data: string): Promise<string> {
    console.log("connect", data);
    return data;
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    console.log("events", data);
    return data;
  }
}
