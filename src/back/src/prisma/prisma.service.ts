// src/prisma/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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
}
