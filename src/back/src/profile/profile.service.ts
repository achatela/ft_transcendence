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
}
