import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        AuthModule,
    ],
    controllers: [ProfileController],
    providers: [ProfileService, PrismaService],
})
export class ProfileModule {}
