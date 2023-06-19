import { Body, Controller, Post } from '@nestjs/common';
import { twoFaService } from './twoFa.service';

@Controller('2fa')
export class twoFaController {
    constructor(private twoFaService: twoFaService) { }

    @Post('create')
    async create2Fa(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        return await this.twoFaService.create2Fa(userInput.username, userInput.accessToken, userInput.refreshToken);
    }

    @Post('verify')
    async verify2Fa(@Body() userInput: { token: string, login: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        return await this.twoFaService.verify2Fa(userInput.token, userInput.login);
    }

    @Post('check_2fa')
    async check2Fa(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, qrCode?: string }> {
        return await this.twoFaService.check2Fa(userInput.username, userInput.refreshToken, userInput.accessToken);
    }

    @Post('disable_2fa')
    async disable2Fa(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        return await this.twoFaService.disable2Fa(userInput.username, userInput.refreshToken, userInput.accessToken);
    }

    @Post('get_qr')
    async getQr(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, qrCode?: string }> {
        return await this.twoFaService.getQr(userInput.username, userInput.refreshToken, userInput.accessToken);
    }
}