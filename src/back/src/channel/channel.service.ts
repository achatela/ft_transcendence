import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChannelService {
    constructor(private prismaService: PrismaService, private authService: AuthService) { }

    async getChannels(body: { username: string; accessToken: string; refreshToken: string; }) {
        const { username, accessToken, refreshToken } = body;
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        // get channels that has isPrivate = false and select channelName, users.length, owner
        const channels = await this.prismaService.channel.findMany({
            where: {
                isPrivate: false,
            },
            select: {
                channelName: true,
                users: true,
                owner: true,
                password: true,
            },
        });
        let retChannels = [];
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            const owner = await this.prismaService.user.findUnique({ where: { id: channel.owner } });
            if (channel.password == '')
                retChannels.push({
                    channelName: channel.channelName,
                    users: channel.users.length,
                    owner: owner.username,
                    hasPassword: false,
                });
            else
                retChannels.push({
                    channelName: channel.channelName,
                    users: channel.users.length,
                    owner: owner.username,
                    hasPassword: true,
                });
        }
        return { success: true, channels: retChannels, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    }

    async createChannel(body: { username: string, accessToken: string, refreshToken: string, channelName: string, channelPassword?: string, isPrivate: boolean }) {
        const { username, accessToken, refreshToken, channelName, channelPassword, isPrivate } = body;
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        let channel = await this.prismaService.channel.findFirst({ where: { channelName: channelName } });
        if (channel) {
            return { success: false, error: 'Channel already exists' };
        }
        const createdChannel = await this.prismaService.channel.create({
            data: {
                channelName: channelName,
                password: channelPassword,
                isPrivate: isPrivate,
                owner: user.id,
                channelMode: isPrivate ? 'private' : 'public',
            },
        });
        const updatedChannel = await this.prismaService.channel.update({
            where: { id: createdChannel.id },
            data: {
                users: {
                    set: [...createdChannel.users, user.id],
                },
            },
        });
        return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    }

    async getChannelMessages(body: { username: string; accessToken: string; refreshToken: string; channelName: string; }) {
        const { username, accessToken, refreshToken, channelName } = body;
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: channelName },
            select: {
                messages: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        const messages = channel.messages;
        let retMessage = [];
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const user = await this.prismaService.user.findUnique({ where: { id: message.senderId } });
            let info = await this.prismaService.user.findUnique({ where: { id: message.senderId } });
            retMessage.push({
                senderId: message.senderId,
                text: message.text,
                time: message.createdAt,
                username: info.username,
                avatar: info.avatar,
            });
        }
        return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, chat: { room: channelName, messages: retMessage } };
    }
}