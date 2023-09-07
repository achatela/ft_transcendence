import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        AuthModule,
    ],
    controllers: [],
    providers: [ChatGateway, PrismaService],
})
export class ProfileModule { }