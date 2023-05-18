import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProfileService {
  constructor(private prismaService: PrismaService, private jwtService: JwtService) {}

  private async verifToken(refreshToken: string, accessToken: string, user: User): Promise<boolean> {
    if (user.accessToken === accessToken) {
      const accessPayload = await this.jwtService.verify(accessToken, { secret: process.env.JWT_ACCESS_SECRET });
      if (accessPayload.exp < Date.now() / 1000) {
        if (user.refreshToken === refreshToken) {
          const payload = {username: user.username, id: user.id};
          const refreshPayload = await this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
          if (refreshPayload.exp < Date.now() / 1000) {
            const refreshToken = await this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '10d' });
            await this.prismaService.user.update({ where: { username: user.username }, data: { refreshToken: refreshToken } });
          }
          const accessToken = await this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '30m' });
          await this.prismaService.user.update({ where: { username: user.username }, data: { accessToken: accessToken } });
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  }

  async getUsername(login: string, refreshToken: string, accessToken: string): Promise<string> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    if (await this.verifToken(refreshToken, accessToken, user))
      return user.login;
  }

  async getWins(login: string, refreshToken: string, accessToken: string): Promise<number> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    if (await this.verifToken(refreshToken, accessToken, user))
      return user.wins;
  }

  async getLosses(login: string, refreshToken: string, accessToken: string): Promise<number> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    if (await this.verifToken(refreshToken, accessToken, user))
      return user.losses;
  }

  async getAvatar(login: string, refreshToken: string, accessToken: string): Promise<string> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    if (await this.verifToken(refreshToken, accessToken, user))
      return user.avatar;
  }
  
  async getLadderLevel(login:string, refreshToken: string, accessToken: string): Promise<number> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    if (await this.verifToken(refreshToken, accessToken, user))
      return user.ladderLevel;
  }
}
