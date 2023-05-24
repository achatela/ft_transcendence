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

@Module({
  imports: [PrismaModule, AuthModule, ProfileModule, JwtModule, SocialModule, twoFaModule],
  controllers: [AppController, ProfileController, AuthController, SocialController, twoFaController],
  providers: [AppService, ProfileService, SocialService],
})
export class AppModule {}
