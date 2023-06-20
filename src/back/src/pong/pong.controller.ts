import { Body, Controller, Post } from '@nestjs/common';
import { PongService } from './pong.service';

@Controller('pong')
@Controller('pong')
export class PongController {
    constructor(private pongService: PongService) { }

    // Classic Pong routes
    @Post('classic/queue_up/')
    async getClassicPong(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        return await this.pongService.queueUpClassicPong(userInput.username, userInput.refreshToken, userInput.accessToken);
    }

    @Post('classic/queue_down/')
    async getClassicPongDown(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        return await this.pongService.queueDownClassicPong(userInput.username, userInput.refreshToken, userInput.accessToken);
    }

    @Post('classic/queue_status/')
    async getClassicPongStatus(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, queueStatus?: string }> {
        return await this.pongService.queueStatusClassicPong(userInput.username, userInput.refreshToken, userInput.accessToken);
    }

    // Custom Pong routes
    @Post('custom/queue_up/')
    async getCustomPong(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        return await this.pongService.queueUpCustomPong(userInput.username, userInput.refreshToken, userInput.accessToken);
    }

    @Post('custom/queue_down/')
    async getCustomPongDown(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        return await this.pongService.queueDownCustomPong(userInput.username, userInput.refreshToken, userInput.accessToken);
    }

    @Post('custom/queue_status/')
    async getCustomPongStatus(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, queueStatus?: string }> {
        return await this.pongService.queueStatusCustomPong(userInput.username, userInput.refreshToken, userInput.accessToken);
    }
}