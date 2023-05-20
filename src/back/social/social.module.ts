import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { SocialService } from './social.service';

@Module({
    imports: [
        AuthModule,
    ],
    controllers: [SocialController],
    providers: [SocialService, PrismaService],
})
export class SocialModule {}
