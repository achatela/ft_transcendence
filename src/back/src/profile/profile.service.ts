import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ProfileService {
  constructor(private prismaService: PrismaService, private authService: AuthService) { }


  async getIsFriend(username: string, refreshToken: string, accessToken: string, profileId: number) {
    const user = await this.prismaService.user.findFirst({ where: { username: username } })
    const userFriend = await this.prismaService.user.findFirst({ where: { id: profileId } })

    if (!user || !userFriend)
      return ({ success: false, error: "User not found" })
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true) {
      const friend = await this.prismaService.friend.findFirst({ where: { friendId: profileId, userId: user.id } })
      if (!friend)
        return ({ success: true, isFriend: false, accessToken: ret.accessToken, refreshToken: ret.refreshToken })
      return ({ success: true, isFriend: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken })
    }
  }

  async checkUserExists(username: string, refreshToken: string, accessToken: string, id: number): Promise<{ success: boolean; refreshToken: string; accessToken: string; }> {
    try {
      await this.prismaService.user.findUniqueOrThrow({ where: { id: id } });
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success == true)
        return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
    }
    catch (e) {
      console.log("Error in checkUserExists: Can't find user with id: ", id);
      return { success: false, refreshToken: refreshToken, accessToken: accessToken };
    }
  }

  async getUserInfoById(id: number, username: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, userInfo: { username?: string, avatar?: string, wins?: number, losses?: number, level?: number }, accessToken: string, refreshToken: string }> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
      const user2 = await this.prismaService.user.findUniqueOrThrow({ where: { id: id } });
      const ret = await this.authService.checkToken(user, refreshToken, accessToken);
      if (ret.success == true)
        return { success: true, userInfo: { username: user2.username, avatar: user2.avatar, wins: user2.wins, losses: user2.losses, level: user2.ladderLevel }, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    }
    catch (e) {
      console.log("Error in getUserInfoById", e)
      return { success: false, userInfo: {}, accessToken: accessToken, refreshToken: refreshToken };
    }
  }

  async getUserInfo(username: string, refreshToken: string, accessToken: string): Promise<{ userInfo: { username: string, wins: number, losses: number, avatar: string, ladderLevel: number, xp: number }, refreshToken: string, accessToken: string }> {
    const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return { userInfo: { username: user.username, wins: user.wins, losses: user.losses, avatar: user.avatar, ladderLevel: user.ladderLevel, xp: user.xpBar }, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
  }

  async getUsername(username: string, refreshToken: string, accessToken: string): Promise<{ username: string, refreshToken: string, accessToken: string }> {
    const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return { username: user.username, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
  }

  async getWins(username: string, refreshToken: string, accessToken: string): Promise<{ wins: number, refreshToken: string, accessToken: string }> {
    const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return { wins: user.wins, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
  }

  async getLosses(username: string, refreshToken: string, accessToken: string): Promise<{ losses: number, refreshToken: string, accessToken: string }> {
    const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return { losses: user.losses, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
  }

  async getAvatar(username: string, refreshToken: string, accessToken: string): Promise<{ avatar: string, refreshToken: string, accessToken: string }> {
    const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return { avatar: user.avatar, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
  }

  async getLadderLevel(username: string, refreshToken: string, accessToken: string): Promise<{ ladderLevel: number, refreshToken: string, accessToken: string }> {
    const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return { ladderLevel: user.ladderLevel, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
  }

  async setUploadedAvatar(avatar: FormData, username: string, refreshToken: string, accessToken: string, fileExtension: string): Promise<{ success: boolean; refreshToken: string; accessToken: string; }> {
    const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: username } });
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true) {
      await this.prismaService.user.update({ where: { username: user.username }, data: { avatar: "http://localhost:3333/uploads/" + username + "." + fileExtension } });
      return ({ success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken });
    }
    return;
  }


  async getMatchHistory(username: string, refreshToken: string, accessToken: string, profileId: number) {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (!user) {
      return ({ success: false, error: "User not found" })
    }
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success != true) {
      return ({ success: false, error: "Wrong token" })
    }
    if (profileId != 0) {
      const userToReturn = await this.prismaService.user.findUnique({ where: { id: profileId } })
      if (!userToReturn) {
        return ({ success: false, error: "Wrong id" })
      }
      const matches = userToReturn.matchHistory.slice(-10);
      return ({ success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, matches: matches })
    }
    else {
      const matches = user.matchHistory.slice(-10);
      return ({ success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, matches: matches })
    }
  }
}
