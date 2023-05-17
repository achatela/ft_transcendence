import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prismaService: PrismaService) {}
  async getUsername(login: string, jwt: string): Promise<string> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    if (user.JwtToken === jwt) {
      return user.login;
    }
  }

  async getWins(login: string, jwt: string): Promise<number> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    if (user.JwtToken === jwt) {
      return user.wins;
    }
  }

  async getLosses(login: string, jwt: string): Promise<number> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    if (user.JwtToken === jwt) {
      return user.losses;
    }
  }

  async getAvatar(login: string, jwt: string): Promise<string> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    console.log("login = ", login, user.JwtToken, jwt)
    if (user.JwtToken === jwt) {
      return user.avatar;
    }
  }
  
  async getLadderLevel(login:string, jwt: string): Promise<number> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    if (user.JwtToken === jwt) {
      return user.ladderLevel;
    }
  }
}
