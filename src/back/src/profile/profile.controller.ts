import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { Console } from 'console';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private authService: AuthService) {}
  @Post('username')
  async getPlayerNumber(@Body() userInput: { username: string, jwt: string} ): Promise<{ username: string; }> {
    const data = await this.profileService.getUsername(userInput.username, userInput.jwt);
    return {username: data};
  }

  @Post('wins')
  async getWins(@Body() userInput: { username: string, jwt: string} ): Promise<{ wins: number; }> {
    const data = await this.profileService.getWins(userInput.username, userInput.jwt);
    return {wins: data};
  }

  @Post('losses')
  async getLosses(@Body() userInput: { username: string, jwt: string} ): Promise<{losses: number}> {
    const data = await this.profileService.getLosses(userInput.username, userInput.jwt);
    return {losses: data};
  }

  @Post('avatar')
  async getAvatar(@Body() userInput: { username: string, jwt: string} ): Promise<{avatarUrl: string}> {
    const data = await this.profileService.getAvatar(userInput.username, userInput.jwt);
    console.log("data = ", data);
    return {avatarUrl: data};
  }

  @Post('ladder_level')
  async getLadderLevel(@Body() userInput: { username: string, jwt: string} ): Promise<{ladderLevel: number}> {
    const data = await this.profileService.getLadderLevel(userInput.username, userInput.jwt);
    return {ladderLevel: data};
  }
}
