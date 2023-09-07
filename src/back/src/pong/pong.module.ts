import { Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';
import { PongController } from './pong.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PongController],
  providers: [PongGateway, PongService],
  exports: [PongService]
})

export class PongModule { }
