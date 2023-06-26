import { Controller } from '@nestjs/common';
import { Post, Body } from '@nestjs/common';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
    constructor(private channelService: ChannelService) { }

    @Post('create')
    async createChannel(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string, channelPassword?: string, isPrivate: boolean }) {
        console.log("create channel body:\n", body);
        return await this.channelService.createChannel(body);
    }

    @Post('getChannels')
    async getChannels(@Body() body: { username: string, accessToken: string, refreshToken: string }) {
        return await this.channelService.getChannels(body);
    }

    // Will need to first add the user to the channel, check if it needs a password etc..
    @Post('get_channel_messages')
    async getChannelMessages(@Body() body: { username: string, accessToken: string, refreshToken: string, channelName: string }) {
        return await this.channelService.getChannelMessages(body);
    }
}
