// src/prisma/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    updateUser(arg0: { where: { username: string; }; data: { personnal42Token: string; }; }) {
        // Set the user's personnal42Token

    }
    constructor() {
        super();
    }

    async onModuleInit() {
        await this.$connect();
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.user.create({
            data,
        });
    }
}
