import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ProfileService {
  constructor(private prismaService: PrismaService, private authService: AuthService) {}

  async getUserInfo(login: string, refreshToken: string, accessToken: string): Promise<{userInfo: {username: string, wins: number, losses: number, avatar: string, ladderLevel: number}, refreshToken: string, accessToken: string}> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return {userInfo: {username: user.username, wins: user.wins, losses: user.losses, avatar: user.avatar, ladderLevel: user.ladderLevel}, refreshToken: ret.refreshToken, accessToken: ret.accessToken};
  }

  async getUsername(login: string, refreshToken: string, accessToken: string): Promise<{username: string, refreshToken: string, accessToken: string}> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return {username: user.username, refreshToken: ret.refreshToken, accessToken: ret.accessToken};
  }

  async getWins(login: string, refreshToken: string, accessToken: string): Promise<{wins: number, refreshToken: string, accessToken: string}> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return {wins: user.wins, refreshToken: ret.refreshToken, accessToken: ret.accessToken};
  }

  async getLosses(login: string, refreshToken: string, accessToken: string): Promise<{losses: number, refreshToken: string, accessToken: string}> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return {losses: user.losses, refreshToken: ret.refreshToken, accessToken: ret.accessToken};
  }

  async getAvatar(login: string, refreshToken: string, accessToken: string): Promise<{avatar: string, refreshToken: string, accessToken: string}> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return {avatar: user.avatar, refreshToken: ret.refreshToken, accessToken: ret.accessToken};
  }
  
  async getLadderLevel(login:string, refreshToken: string, accessToken: string): Promise<{ladderLevel: number, refreshToken: string, accessToken: string}> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return {ladderLevel: user.ladderLevel, refreshToken: ret.refreshToken, accessToken: ret.accessToken};
  }

  async setUploadedAvatar(avatar: FormData, login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean; refreshToken: string; accessToken: string; }> {
    const user = await this.prismaService.user.findUnique({ where: { login: login } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true) {
      // needs to find a way to access it from the front
      // await this.prismaService.user.update({ where: { username: user.username }, data: { avatar: "http://localhost:3333/uploads/" + login + ".png" } });
      return ( { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken} );
    }
    return ;
  }
}
