import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ProfileService {
  constructor(private prismaService: PrismaService, private authService: AuthService) { }

  async checkValidity(username: string, refreshToken: string, accessToken: string) {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (!user)
      return ({ success: false, error: "User not found" })
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
    return { success: false, error: "Wrong token" };
  }

  async changeUsername(username: string, refreshToken: string, accessToken: string, newUsername: string) {
    const user = await this.prismaService.user.findUnique({ where: { username: username } })
    if (!user)
      return ({ success: false, error: "User not found" })
    const check_user = await this.prismaService.user.findUnique({ where: { username: newUsername } })
    if (check_user)
      return ({ success: false, error: "Username already taken" })
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true) {
      const historyArray = user.matchHistory;
      let newArray = [];
      for (let i = 0; i < historyArray.length; i++) {
        let modify = historyArray[i];
        if (modify.includes(username)) {
          let splited = modify.split(" ");
          let otherUser = "";
          for (let j = 0; j < splited.length; j++) {
            if (splited[j].includes(":") && (splited[j] != ("W:" + username) && splited[j] != ("L:" + username))) { //&& !splited[j].includes(username)) {
              otherUser = splited[j].split(":")[1];
              break;
            }
          }
          if (otherUser != "") {
            const userToModify = await this.prismaService.user.findUnique({ where: { username: otherUser } })
            if (userToModify) {
              let newHistory = userToModify.matchHistory;
              for (let k = 0; k < newHistory.length; k++) {
                if (newHistory[k].includes(username)) {
                  newHistory[k] = newHistory[k].replace(username, newUsername);
                }
              }
              await this.prismaService.user.update({ where: { username: otherUser }, data: { matchHistory: newHistory } });
            }
          }
          modify = modify.replace(username, newUsername);
        }
        newArray.push(modify);
      }
      const changeAvatar = await this.prismaService.user.update({ where: { username: user.username }, data: { matchHistory: newArray } });
      await this.prismaService.user.update({ where: { username: user.username }, data: { username: newUsername } });

      const filePath = changeAvatar.avatar;
      if (filePath.includes('uploads')) {
        const array = filePath.split('/');
        const fileName = array[array.length - 1];
        const fileExtension = fileName.split('.')[fileName.split('.').length - 1];

        const oldPath = path.join('./uploads', `${username}.${fileExtension}`);
        const newPath = path.join('./uploads', `${newUsername}.${fileExtension}`);
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          await this.prismaService.user.update({
            where: { username: newUsername },
            data: { avatar: "http://" + process.env.HOST + ":3333/uploads/" + newUsername + "." + fileExtension }
          });
        } else {
          console.log('Source file does not exist');
        }
      }

      return ({ success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken })
    }
    else {
      return ({ success: false, error: "Wrong token" })
    }
  }

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

  async getUserInfoById(id: number, username: string, refreshToken: string, accessToken: string) {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (!user)
      return ({ success: false, error: "User not found" })
    const user2 = await this.prismaService.user.findUnique({ where: { id: id } });
    if (!user2)
      return ({ success: false, error: "UserID not found" })

    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return { success: true, userInfo: { username: user2.username, avatar: user2.avatar, wins: user2.wins, losses: user2.losses, level: user2.ladderLevel }, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    return { success: false, error: "Wrong token" };
  }

  async getUserInfo(username: string, refreshToken: string, accessToken: string) {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
    if (!user)
      return ({ success: false, error: "User not found" })
    const ret = await this.authService.checkToken(user, refreshToken, accessToken);
    if (ret.success == true)
      return { success: true, userInfo: { username: user.username, wins: user.wins, losses: user.losses, avatar: user.avatar, ladderLevel: user.ladderLevel, xp: user.xpBar }, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
    return { success: false, error: "Wrong token" }
  }

  async getUsername(username: string, refreshToken: string, accessToken: string): Promise<{ username: string, refreshToken: string, accessToken: string }> {
    const user = await this.prismaService.user.findUnique({ where: { username: username } });
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
      await this.prismaService.user.update({ where: { username: user.username }, data: { avatar: "http://" + process.env.HOST + ":3333/uploads/" + username + "." + fileExtension } });
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
