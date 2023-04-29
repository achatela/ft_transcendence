// src/prisma/prisma.service.ts
import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        super();
    }

    async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
        await app.close();
    });
    }

      async createUser(user: {}): Promise<User> {
        const newUser = await prisma.user.create({
            data: user['body'],
        });
        return newUser;
    }
}
