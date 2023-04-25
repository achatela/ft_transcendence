import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly appService: ProfileService) {}
  @Get('username')
  getPlayerNumber(): {} {
    return this.appService.getUsername();
  }

  @Get('wins')
  getWins(): {} {
    return this.appService.getWins();
  }

  @Get('losses')
  getLosses(): {} {
    return this.appService.getLosses();
  }

  @Get('avatar')
  getAvatar(): {} {
    return this.appService.getAvatar();
  }

  @Get('ladder_level')
  getLadderLevel(): {} {
    return this.appService.getLadderLevel();
  }
}
