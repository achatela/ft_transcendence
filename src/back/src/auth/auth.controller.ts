import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('redirect')
    getRedirectUrl(@Body() userInput: { username: string }): any {
        // Check if username is already in database
        // Return error
        console.log("username = ", userInput.username)
        const redirectUrl = this.authService.redirectUrl(userInput.username);
        return {
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
