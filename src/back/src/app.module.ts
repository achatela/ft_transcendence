import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, ProfileController],
  providers: [AppService, ProfileService],
})
export class AppModule {}
