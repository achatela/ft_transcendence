import { Controller } from '@nestjs/common';
import { Post, Get, Body } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('prisma')
export class PrismaController {
    constructor(private readonly prismaService: PrismaService) {}
    // @Post('create_user')
    // async createUser(@Body() data: {}): Promise<{ success: boolean; }> {
    //     const newUser = await this.prismaService.createUser(data);
    //     console.log(newUser);
    //     return ({success: true})
    // }
}