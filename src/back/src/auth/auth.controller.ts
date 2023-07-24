import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private prismaService: PrismaService, private jwtService: JwtService) { }

    
    @Post('verify_sign_up')
    async getVerifySignUp(@Body() userInput: { username: string, password: string }) {
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
    
}
