import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { Console } from 'console';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private authService: AuthService) {}
  @Post('username')
  async getPlayerNumber(@Body() userInput: { login: string, jwt: string} ): Promise<{ login: string; }> {
    const data = await this.profileService.getUsername(userInput.login, userInput.jwt);
    return {login: data};
  }

  @Post('wins')
  async getWins(@Body() userInput: { login: string, jwt: string} ): Promise<{ wins: number; }> {
    const data = await this.profileService.getWins(userInput.login, userInput.jwt);
    return {wins: data};
  }

  @Post('losses')
  async getLosses(@Body() userInput: { login: string, jwt: string} ): Promise<{losses: number}> {
    const data = await this.profileService.getLosses(userInput.login, userInput.jwt);
    return {losses: data};
  }

  @Post('avatar')
  async getAvatar(@Body() userInput: { login: string, jwt: string} ): Promise<{avatarUrl: string}> {
    const data = await this.profileService.getAvatar(userInput.login, userInput.jwt);
    console.log("data = ", data);
    return {avatarUrl: data};
  }

  @Post('ladder_level')
  async getLadderLevel(@Body() userInput: { login: string, jwt: string} ): Promise<{ladderLevel: number}> {
    const data = await this.profileService.getLadderLevel(userInput.login, userInput.jwt);
    return {ladderLevel: data};
  }
}
