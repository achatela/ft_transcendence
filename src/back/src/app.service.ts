import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor() { }

  async clearDatabase() {
    const prisma = new PrismaService();
    const users = await prisma.user.findMany();
    for (const user of users) {
      await prisma.user.update({ where: { username: user.username }, data: { status: "offline" } })
    }
    await prisma.$disconnect();
  }
}
