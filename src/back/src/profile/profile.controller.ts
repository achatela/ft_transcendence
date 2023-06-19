import { Body, Controller, Get, Req, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { Console } from 'console';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private authService: AuthService) { }

  @Post('user_info')
  async getUserInfo(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ userInfo: { username: string, wins: number, losses: number, avatar: string, ladderLevel: number }, refreshToken: string, accessToken: string }> {
    return await this.profileService.getUserInfo(userInput.username, userInput.refreshToken, userInput.accessToken);
  }

  @Post('username')
  async getPlayerNumber(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ username: string, refreshToken: string, accessToken: string }> {
    return await this.profileService.getUsername(userInput.username, userInput.refreshToken, userInput.accessToken);
  }

  @Post('wins')
  async getWins(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ wins: number, refreshToken: string, accessToken: string }> {
    return await this.profileService.getWins(userInput.username, userInput.refreshToken, userInput.accessToken);
  }

  @Post('losses')
  async getLosses(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ losses: number, refreshToken: string, accessToken: string }> {
    return await this.profileService.getLosses(userInput.username, userInput.refreshToken, userInput.accessToken);
  }

  @Post('avatar')
  async getAvatar(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ avatar: string, refreshToken: string, accessToken: string }> {
    return await this.profileService.getAvatar(userInput.username, userInput.refreshToken, userInput.accessToken);
  }

  @Post('ladder_level')
  async getLadderLevel(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ ladderLevel: number, refreshToken: string, accessToken: string }> {
    return await this.profileService.getLadderLevel(userInput.username, userInput.refreshToken, userInput.accessToken);
  }

  @Post('user_check')
  async checkUserExists(@Body() userInput: { username: string, refreshToken: string, accessToken: string, id: number }): Promise<{ success: boolean, refreshToken: string, accessToken: string }> {
    return await this.profileService.checkUserExists(userInput.username, userInput.refreshToken, userInput.accessToken, userInput.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const fileExtension = file.originalname.split('.').pop();
        callback(null, `undefined.${fileExtension}`);
      },
    }),
  }))

  async uploadAvatar(@UploadedFile() file, @Req() request) {
    // Needs to check JWT
    const avatar = file;
    const fileExtension = file.originalname.split('.').pop();
    const { username, refreshToken, accessToken } = request.body;
    const oldPath = path.join(__dirname, '../uploads', `undefined.${fileExtension}`);
    const newPath = path.join(__dirname, '../uploads', `${username}.${fileExtension}`);
    const directory = path.join(__dirname, '../uploads');

    try {
      const files = fs.readdirSync(directory);
      const filesToDelete = files.filter(file => file.startsWith(username));
      for (const file of filesToDelete) {
        const filePath = path.join(directory, file);

        try {
          fs.unlinkSync(filePath);
          console.log(`Old avatar deleted: ${file}`);
        } catch {
          console.log(`Error while deleting old avatar: ${file}`);
        }
      }
    } catch {
      console.log("Error while reading directory");
    }

    try {
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          throw err;
        } else {
          console.log('Successfully moved the file!');
        }
      });

    }
    catch {
      console.log("Error while renaming file");
    }

    return await this.profileService.setUploadedAvatar(avatar, username, refreshToken, accessToken, fileExtension);
  }

  @Post(":id/")
  async getUserProfileById(@Body() userInput: { username: string, refreshToken: string, accessToken: string, id: number }): Promise<{ success?: boolean, userInfo: { username?: string, wins?: number, losses?: number, avatar?: string, ladderLevel?: number }, refreshToken: string, accessToken: string }> {
    return await this.profileService.getUserInfoById(userInput.id, userInput.username, userInput.refreshToken, userInput.accessToken);
  }
}
