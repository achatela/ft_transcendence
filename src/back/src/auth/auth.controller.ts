import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    @Post('verify_sign_up')
    async getVerifySignUp(@Body() userInput: { username: string, password: string }) {
        const regexSpe = /^[\x00-\x7F]+$/;
        if (!regexSpe.test(userInput.username))
            return { success: false, error: "Username cannot contain special characters" };
        if (userInput.username != undefined && userInput.username.length > 9) {
            return { success: false, error: "Username too long (9 characters maximum)" };
        }
        if (userInput.username != undefined && /\s/.test(userInput.username)) {
            return { success: false, error: "Username cannot contain whitespaces" };
        }
        return await this.authService.getVerifySignUp(userInput.username, userInput.password)
    }

    @Post('verify_sign_in')
    async getVerifySignIn(@Body() userInput: { username: string, password: string }) {
        return await this.authService.getVerifySignIn(userInput.username, userInput.password)
    }

    @Get('redirect_forty_two')
    async getRedirectFortyTwo() {
        return await this.authService.getRedirectFortyTwo();
    }

    @Post('verify_sign_in_42')
    async verifySignIn(@Body() userInput: { code: string }) {
        return await this.authService.verifySignIn(userInput.code)
    }

    @Post('log_out')
    async logOut(@Body() userInput: { username: string, refreshToken: string, accessToken: string }) {
        return await this.authService.logOut(userInput.username, userInput.refreshToken, userInput.accessToken)
    }

}
