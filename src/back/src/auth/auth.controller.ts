import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private prismaService: PrismaService) {}
    @Post('redirect')
    getRedirectUrl(@Body() userInput: { username: string }): any {
        

        console.log("username = ", userInput.username)
        const redirectUrl = this.authService.redirectUrl(userInput.username);// Check if username is already in database
        // Return error
        // return {
        //     success: false,
        //     error: "Username already exists",
        //     url: redirectUrl,
        // }

        // If the username is not in the database, create it
        this.prismaService.createUser({username: userInput.username, hashedPassword: "1234"});

        return {
            success: true,
            url: redirectUrl,
        };
    }

    @Post('get_code')
    getCode(@Body() userInput: { code: string }): any {
        this.authService.getUserToken(userInput.code);
        return {
            success: true,
        }
    }
}
