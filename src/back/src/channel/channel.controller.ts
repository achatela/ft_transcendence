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
    async createChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, password?: string, isPrivate: boolean }) {
        console.log("create channel body:\n", body);
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

    // Will need to first add the user to the channel, check if it needs a password etc..
    @Post('get_channel_messages')
    async getChannelMessages(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string }) {
        return await this.channelService.getChannelMessages(body);
    }

    @Post('quit_channel')
    async quitChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string }) {
        return await this.channelService.quitChannel(body);
    }
}
