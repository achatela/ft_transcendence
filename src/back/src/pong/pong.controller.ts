import { Body, Controller, Post } from '@nestjs/common';
import { PongService } from './pong.service';

@Controller('pong')
export class PongController {
    constructor(private pongService: PongService) { }
    @Post('classic/queue_up/')
    async getClassicPong(@Body() userInput: { login: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        return await this.pongService.queueUpClassicPong(userInput.login, userInput.refreshToken, userInput.accessToken);
    }

    @Post('classic/queue_down/')
    async getClassicPongDown(@Body() userInput: { login: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        return await this.pongService.queueDownClassicPong(userInput.login, userInput.refreshToken, userInput.accessToken);
    }

    @Post('classic/queue_status/')
    async getClassicPongStatus(@Body() userInput: { login: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, queueStatus?: string }> {
        return await this.pongService.queueStatusClassicPong(userInput.login, userInput.refreshToken, userInput.accessToken);
    }

    @Post('custom/queue_up/')
    async getCustomPong(): Promise<string> {
        return 'Custom Pong';
    }
}