import { Body, Controller, Post } from '@nestjs/common';
import { PongService } from './pong.service';

@Controller('pong')
@Controller('pong')
export class PongController {
    constructor(private pongService: PongService) { }

    // Classic Pong routes
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

    // Custom Pong routes
    @Post('custom/queue_up/')
    async getCustomPong(@Body() userInput: { login: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        return await this.pongService.queueUpCustomPong(userInput.login, userInput.refreshToken, userInput.accessToken);
    }

    @Post('custom/queue_down/')
    async getCustomPongDown(@Body() userInput: { login: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        return await this.pongService.queueDownCustomPong(userInput.login, userInput.refreshToken, userInput.accessToken);
    }

    @Post('custom/queue_status/')
    async getCustomPongStatus(@Body() userInput: { login: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, queueStatus?: string }> {
        return await this.pongService.queueStatusCustomPong(userInput.login, userInput.refreshToken, userInput.accessToken);
    }
}