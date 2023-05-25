import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('player_number')
export class AppController {
  constructor(private readonly appService: AppService) { }
}
