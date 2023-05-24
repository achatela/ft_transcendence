import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PrismaService } from 'src/prisma/prisma.service';

import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [AuthService, PrismaService, JwtService],
  controllers: [AuthController],
  exports: [AuthService, JwtService]
})

export class AuthModule {}
