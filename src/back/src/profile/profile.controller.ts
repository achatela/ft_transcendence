import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private authService: AuthService) {}
  @Get('username')
  getPlayerNumber(): {} {
    this.authService.print();
    return this.profileService.getUsername();
  }

  @Get('wins')
  getWins(): {} {
    return this.profileService.getWins();
  }

  @Get('losses')
  getLosses(): {} {
    return this.profileService.getLosses();
  }

  @Get('avatar')
  getAvatar(): {} {
    return this.profileService.getAvatar();
  }

  @Get('ladder_level')
  getLadderLevel(): {} {
    return this.profileService.getLadderLevel();
  }

  @Post('create_user')
  async signupUser( @Body() userData: { username: string; hashedPassword: string;})
    : Promise<User>
  {
    return this.profileService.createUser(userData);
  }
}
