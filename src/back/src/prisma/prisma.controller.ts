import { Controller } from '@nestjs/common';
import { Post, Get, Body } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('prisma')
export class PrismaController {
    constructor(private readonly prismaService: PrismaService) {}
}