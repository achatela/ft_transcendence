import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { JwtModule } from '@nestjs/jwt';
import { SocialController } from 'social/social.controller';
import { SocialModule } from 'social/social.module';
import { SocialService } from 'social/social.service';
import { twoFaController } from './twoFa/twoFa.controller';
import { twoFaModule } from './twoFa/twoFa.module';
import { PongModule } from './pong/pong.module';
import { PongController } from './pong/pong.controller';
import { ChatGateway } from './chat/chat.gateway';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [PrismaModule, AuthModule, ProfileModule, JwtModule, SocialModule, twoFaModule, PongModule, ChannelModule],
  controllers: [AppController, ProfileController, AuthController, SocialController, twoFaController, PongController],
  providers: [AppService, ProfileService, SocialService, ChatGateway],
})
export class AppModule { }
