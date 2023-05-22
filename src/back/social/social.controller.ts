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
    async declineFriendRequest(@Body() userInput: {usernameToDecline:string, loginUser: string, accessToken: string, refreshToken: string, }): Promise<{success: boolean, accessToken?: string, refreshToken?:string}> {
        return await this.socialService.declineFriendRequest(userInput.usernameToDecline, userInput.loginUser,  userInput.accessToken, userInput.refreshToken);
    }

    @Post('friend_list')
    async getFriendList(@Body() userInput: {login: string, accessToken: string, refreshToken: string}): Promise<{success: boolean, accessToken?: string, refreshToken?:string, listFriend?: string[]}> {
        return await this.socialService.getFriendList(userInput.login, userInput.accessToken, userInput.refreshToken);
    }

    @Post('send_friend_request')
    async sendFriendRequest(@Body() userInput: {loginUser: string, accessToken: string, refreshToken: string, usernameToSend: string}): Promise<{error?: string, success: boolean, accessToken?: string, refreshToken?:string}> {
        if (userInput.usernameToSend === '' )
            return ({success: false});
        return await this.socialService.sendFriendRequest(userInput.loginUser, userInput.accessToken, userInput.refreshToken, userInput.usernameToSend);
    }

    @Post('remove_friend')
    async removeFriend(@Body() userInput: {usernameToRemove: string, loginUser: string, refreshToken: string, accessToken: string}): Promise<{success: boolean, accessToken?: string, refreshToken?:string}> {
        return await this.socialService.removeFriend(userInput.usernameToRemove, userInput.loginUser, userInput.refreshToken, userInput.accessToken);
    }
}