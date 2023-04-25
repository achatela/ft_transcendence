// src/prisma/prisma.service.ts
import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class PrismaService extends PrismaClient {
    async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
        await app.close();
    });
    }

    //   async createUser(user: User): Promise<User> {
    //   const newUser = await prisma.user.create({
    //     data: {
    //       name: user.name,
    //       email: user.email,
    //       password: user.password,
    //     },
    //   });
    //   return newUser;
    // }
}
