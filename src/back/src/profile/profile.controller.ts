import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { Console } from 'console';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private authService: AuthService) {}

  @Post('user_info')
  async getUserInfo(@Body() userInput: { login: string, refreshToken: string, accessToken: string} ): Promise<{userInfo: {username: string, wins: number, losses: number, avatar: string, ladderLevel: number}, refreshToken: string, accessToken: string}> {
    return await this.profileService.getUserInfo(userInput.login, userInput.refreshToken, userInput.accessToken);
  }

  @Post('username')
  async getPlayerNumber(@Body() userInput: { login: string, refreshToken: string, accessToken: string} ): Promise<{username: string, refreshToken: string, accessToken: string}> {
    return await this.profileService.getUsername(userInput.login, userInput.refreshToken, userInput.accessToken);
  }

  @Post('wins')
  async getWins(@Body() userInput: { login: string, refreshToken: string, accessToken: string} ): Promise<{wins: number, refreshToken: string, accessToken: string}> {
    return await this.profileService.getWins(userInput.login, userInput.refreshToken, userInput.accessToken);
  }

  @Post('losses')
  async getLosses(@Body() userInput: { login: string, refreshToken: string, accessToken: string} ): Promise<{losses: number, refreshToken: string, accessToken: string}> {
    return await this.profileService.getLosses(userInput.login, userInput.refreshToken, userInput.accessToken);
  }

  @Post('avatar')
  async getAvatar(@Body() userInput: { login: string, refreshToken: string, accessToken: string} ): Promise<{avatar: string, refreshToken: string, accessToken: string}> {
    return await this.profileService.getAvatar(userInput.login, userInput.refreshToken, userInput.accessToken);
  }

  @Post('ladder_level')
  async getLadderLevel(@Body() userInput: { login: string, refreshToken: string, accessToken: string} ): Promise<{ladderLevel: number, refreshToken: string, accessToken: string}> {
    return await this.profileService.getLadderLevel(userInput.login, userInput.refreshToken, userInput.accessToken);
  }
}
