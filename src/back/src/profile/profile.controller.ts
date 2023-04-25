import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly appService: ProfileService) {}
  @Get('username')
  getPlayerNumber(): {} {
    return this.appService.getUsername();
  }
}
