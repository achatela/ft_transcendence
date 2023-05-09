import { Controller, Get } from '@nestjs/common';
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
}
