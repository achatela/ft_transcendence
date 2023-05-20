import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
    constructor(private socialService: SocialService) {}
    
    @Post('friend_request')
    async getSocial(@Body() userInput: {login: string, accessToken: string, refreshToken: string}): Promise<{success: boolean, accessToken?: string, refreshToken?:string, listRequest?: string[]}> {
        return await this.socialService.getFriendRequest(userInput.login, userInput.accessToken, userInput.refreshToken);
    }

    @Post('accept_friend_request')
    async acceptFriendRequest(@Body() userInput: {usernameToAccept:string, loginUser: string, accessToken: string, refreshToken: string}): Promise<{success: boolean, accessToken?: string, refreshToken?:string}> {
        return await this.socialService.acceptFriendRequest(userInput.usernameToAccept, userInput.loginUser, userInput.accessToken, userInput.refreshToken);
    }

    @Post('decline_friend_request')
    async declineFriendRequest(@Body() userInput: {usernameToAccept:string, loginUser: string, accessToken: string, refreshToken: string, }): Promise<{success: boolean, accessToken?: string, refreshToken?:string}> {
        return await this.socialService.declineFriendRequest(userInput.usernameToAccept, userInput.loginUser,  userInput.accessToken, userInput.refreshToken);
    }
}