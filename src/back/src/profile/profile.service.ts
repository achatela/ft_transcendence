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
        avatarUrl: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200",
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
