import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Get('redirect')
    getRedirectUrl(): any {
        const redirectUrl = this.authService.redirectUrl();
        return {
            url: redirectUrl,
        };
    }

    @Post('get_code')
    getCode(@Body() userCode: { code: string}): any {
        this.authService.getUserToken(userCode.code);
        return {
            success: true,
        }
    }
}
