import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prismaService: PrismaService) {}
  async getUsername(username: string, jwt: string): Promise<string> {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (user.JwtToken === jwt) {
      return user.username;
    }
  }

  async getWins(username: string, jwt: string): Promise<number> {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (user.JwtToken === jwt) {
      return user.wins;
    }
  }

  async getLosses(username: string, jwt: string): Promise<number> {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (user.JwtToken === jwt) {
      return user.losses;
    }
  }

  async getAvatar(username: string, jwt: string): Promise<string> {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (user.JwtToken === jwt) {
      return user.avatar;
    }
  }
  
  async getLadderLevel(username:string, jwt: string): Promise<number> {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (user.JwtToken === jwt) {
      return user.ladderLevel;
    }
  }
}
