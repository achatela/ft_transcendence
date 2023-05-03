import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}
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

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
        data,
    });
}
}
