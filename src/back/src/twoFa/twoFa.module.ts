import { Module } from '@nestjs/common';
import { twoFaService } from './twoFa.service';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
      AuthModule,
  ],
  providers: [twoFaService, AuthService, PrismaService],
  exports: [twoFaService],
})
export class twoFaModule {}
