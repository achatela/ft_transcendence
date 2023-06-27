import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
    constructor(private socialService: SocialService) { }

    @Post('blocked_ids')
    async blockedIds(@Body() body: { username: string, accessToken: string, refreshToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, error?: string, blockedIds?: number[] }> {
        return await this.socialService.blockedIds(body);
    }

    @Post('block_user')
    async blockUser(@Body() body: { username: string, blockedUsername: string, accessToken: string; refreshToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, error?: string }> {
        return await this.socialService.blockUser(body);
    }

    @Post('friend_request')
    async getSocial(@Body() userInput: { username: string, accessToken: string, refreshToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, listRequest?: string[] }> {
        return await this.socialService.getFriendRequests(userInput.username, userInput.accessToken, userInput.refreshToken);
    }

    @Post('accept_friend_request')
    async acceptFriendRequest(@Body() userInput: { accepterUsername: string, acceptedUsername: string, accessToken: string, refreshToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        console.log("acceptedUsername:", userInput.acceptedUsername);
        return await this.socialService.acceptFriendRequest(userInput.accepterUsername, userInput.acceptedUsername, userInput.accessToken, userInput.refreshToken);
    }

    @Post('decline_friend_request')
    async declineFriendRequest(@Body() userInput: { declinerUsername: string, declinedUsername: string, accessToken: string, refreshToken: string, }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        return await this.socialService.declineFriendRequest(userInput.declinerUsername, userInput.declinedUsername, userInput.accessToken, userInput.refreshToken);
    }

    @Post('friends')
    async getFriends(@Body() userInput: { username: string, accessToken: string, refreshToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, friends?: string[] }> {
        return await this.socialService.getFriends(userInput.username, userInput.accessToken, userInput.refreshToken);
    }

    @Post('send_friend_request')
    async sendFriendRequest(@Body() userInput: { requesterUsername: string, requestedUsername: string, accessToken: string, refreshToken: string }): Promise<{ error?: string, success: boolean, accessToken?: string, refreshToken?: string }> {
        if (userInput.requestedUsername === '')
            return ({ success: false });
        return await this.socialService.sendFriendRequest(userInput.requesterUsername, userInput.requestedUsername, userInput.accessToken, userInput.refreshToken);
    }

    @Post('remove_friend')
    async removeFriend(@Body() userInput: { removerUsername: string, removedUsername: string, refreshToken: string, accessToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        return await this.socialService.removeFriend(userInput.removerUsername, userInput.removedUsername, userInput.refreshToken, userInput.accessToken);
    }

    @Post('friend_chat')
    async getFriendChat(@Body() userInput: { username: string, friendUsername: string, accessToken: string, refreshToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, chat?: { room: string, messages: any[] } }> {
        return await this.socialService.getFriendChat(userInput.username, userInput.friendUsername, userInput.accessToken, userInput.refreshToken);
    }

    @Post('get_friend_id')
    async getFriendId(@Body() userInput: { username: string, friendUsername: string, accessToken: string, refreshToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, id?: number }> {
        return await this.socialService.getFriendId(userInput.username, userInput.friendUsername, userInput.refreshToken, userInput.accessToken);
    }

    @Post('get_avatar')
    async getAvatar(@Body() userInput: { username: string }): Promise<{ success: boolean, avatar?: string }> {
        return await this.socialService.getAvatar(userInput.username);
    }
}