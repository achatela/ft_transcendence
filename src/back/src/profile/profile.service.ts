import { Injectable } from '@nestjs/common';
@Injectable()
export class ProfileService {
  getUsername(): {} {
    return( 
      {
        username: 'username',
      }
    );
  }

  getWins(): {} {
    return( 
      {
        wins: 1,
      }
    );
  }

  getLosses(): {} {
    return( 
      {
        losses: 2,
      }
    );
  }

  getAvatar(): {} {
    return( 
      {
        avatarUrl: "/defaultPfp.png",
      }
    );
  }
  
  getLadderLevel(): {} {
    return( 
      {
        ladderLevel: 1,
      }
    );
  }
}
