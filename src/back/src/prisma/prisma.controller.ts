import { Controller } from '@nestjs/common';
import { Post, Get, Body } from '@nestjs/common';


@Controller('prisma')
export class PrismaController {
    constructor() {}
    @Post('create_user')
    createUser(@Body() data: {}): {success: boolean} {
        console.log(data);
        return ({success: true})
    }
}
