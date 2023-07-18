import { Controller } from '@nestjs/common';
import { Post, Body } from '@nestjs/common';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
    constructor(private channelService: ChannelService) { }

    @Post('join')
    async joinChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, password?: string }) {
        return await this.channelService.joinChannel(body);
    }

    @Post('create')
    async createChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, hasPassword: boolean, password?: string, isPrivate: boolean }) {
        return await this.channelService.createChannel(body);
    }

    @Post('get_channels')
    async getChannels(@Body() body: { username: string, accessToken: string, refreshToken: string }) {
        return await this.channelService.getChannels(body);
    }

    @Post('get_your_channels')
    async getYourChannels(@Body() body: { username: string, accessToken: string, refreshToken: string }) {
        return await this.channelService.getYourChannels(body);
    }

    @Post('get_channel_messages')
    async getChannelMessages(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string }) {
        return await this.channelService.getChannelMessages(body);
    }

    @Post('quit_channel')
    async quitChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string }) {
        return await this.channelService.quitChannel(body);
    }

    @Post('kick_user_channel')
    async kickUserChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, targetUsername: string }) {
        return await this.channelService.kickUserChannel(body);
    }

    @Post('ban_user_channel')
    async banUserChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, targetUsername: string }) {
        return await this.channelService.banUserChannel(body);
    }

    @Post('mute_user_channel')
    async muteUserChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, targetUsername: string, duration: number }) {
        return await this.channelService.muteUserChannel(body);
    }

    @Post('change_password_channel')
    async changePasswordChannel(@Body() body: { username: string, newPassword: string, accessToken: string, refreshToken: string, channelName: string }) {
        return await this.channelService.changePasswordChannel(body);
    }

    @Post('invite_user_channel')
    async inviteUserChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, invitedUser: string }) {
        return await this.channelService.inviteUserChannel(body);
    }

    @Post('get_channel_invites')
    async getChannelInvites(@Body() body: { username: string, accessToken: string, refreshToken: string }) {
        return await this.channelService.getChannelInvites(body);
    }

    @Post('accept_channel_invite')
    async acceptChannelInvite(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string }) {
        return await this.channelService.acceptChannelInvite(body);
    }

    @Post('decline_channel_invite')
    async declineChannelInvite(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string }) {
        return await this.channelService.declineChannelInvite(body);
    }

    @Post('promote_user_channel')
    async promoteUserChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, targetUsername: string }) {
        return await this.channelService.promoteUserChannel(body);
    }

    @Post('demote_user_channel')
    async demoteUserChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, targetUsername: string }) {
        return await this.channelService.demoteUserChannel(body);
    }
}
