import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  getPlayerNumber(): {} {
    return( 
      {
        currentPlayers: 1,
      }
    );
  }
}
