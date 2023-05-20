import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
    constructor(private socialService: SocialService) {}
    
    @Post('friend_request')
    async getSocial(@Body() userInput: {login: string, accessToken: string, refreshToken: string}): Promise<{success: boolean, accessToken?: string, refreshToken?:string, listRequest?: string[]}> {
        return await this.socialService.getFriendRequest(userInput.login, userInput.accessToken, userInput.refreshToken);
    }
}