import { Body, Controller, Post } from '@nestjs/common';
import { twoFaService } from './twoFa.service';

@Controller('2fa')
export class twoFaController {
    constructor(private twoFaService: twoFaService) { }

    @Post('create')
    async create2Fa(@Body() userInput: { login: string, refreshToken: string, accessToken: string }): Promise<void> {
        return await this.twoFaService.create2Fa(userInput.login, userInput.accessToken, userInput.refreshToken);
    }

    @Post('verify')
    async verify2Fa(@Body() userInput: { token: number, login: string }): Promise<void> {
        return await this.twoFaService.verify2Fa(userInput.token, userInput.login);
    }
}