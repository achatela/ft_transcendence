import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController, ProfileController, AuthController],
  providers: [AppService, ProfileService],
})
export class AppModule {}
