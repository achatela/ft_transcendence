import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChannelService {
    constructor(private prismaService: PrismaService, private authService: AuthService) { }

    async quitChannel(body: { username: string; accessToken: string; refreshToken: string; channelName: string; }) {
        const { username, accessToken, refreshToken, channelName } = body;
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (ret.success == false) {
            return { success: false, error: 'Invalid token' };
        }
        const channel = await this.prismaService.channel.findUnique({ where: { channelName: channelName } });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (user.id === channel.owner) {
            await this.prismaService.channel.delete({ where: { channelName: channelName } });
            return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
        }
        else {
            await this.prismaService.channel.update({
                where: { channelName: channelName },
                data: {
                    users: {
                        set: channel.users.filter((id) => id !== user.id),
                    },
                },
            });
            return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
        }

    }

    async getYourChannels(body: { username: string; accessToken: string; refreshToken: string; }) {
        const { username, accessToken, refreshToken } = body;
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (ret.success == false) {
            return { success: false, error: 'Invalid token' };
        }
        // find every channel where user.id is in channel.users
        const channels = await this.prismaService.channel.findMany({
            where: {
                users: {
                    has: user.id,
                },
            },
            select: {
                channelName: true,
                users: true,
            },
        });
        const channelsNames = channels.map((channel) => {
            return {
                channelName: channel.channelName,
            };
        });
        return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, yourChannels: channelsNames };
    }

    async joinChannel(body: { username: string; accessToken: string; refreshToken: string; channelName: string; password?: string; }) {
        const { username, accessToken, refreshToken, channelName, password } = body;
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (ret.success == false) {
            return { success: false, error: 'Invalid token' };
        }
        const channel = await this.prismaService.channel.findUnique({ where: { channelName: channelName } });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (channel.bannedIds.includes(user.id)) {
            return { success: false, error: 'You are banned from this channel' };
        }
        const userInChannel = channel.users.find((id) => id == user.id);
        if (userInChannel) {
            return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
        }
        if (channel.password != '') {
            console.log("channel password: ", channel.password);
            console.log("password: ", password)
            if (channel.password != password) {
                return { success: false, error: 'Invalid password' };
            }
        }
        await this.prismaService.channel.update({
            where: { id: channel.id },
            data: {
                users: {
                    push: user.id,
                },
            },
        });
        return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    }

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

    async createChannel(body: { username: string, accessToken: string, refreshToken: string, channelName: string, password?: string, isPrivate: boolean }) {
        const { username, accessToken, refreshToken, channelName, password, isPrivate } = body;
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
                password: password,
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

    async kickUserChannel(body: { username: string; accessToken: string; refreshToken: string; channelName: string; targetUsername: string; }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: body.channelName },
            select: {
                users: true,
                owner: true,
                admins: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (channel.owner != user.id && !channel.admins.includes(user.id)) {
            return { success: false, error: 'You are not admin' };
        }
        const targetUser = await this.prismaService.user.findUnique({ where: { username: body.targetUsername } });
        if (!targetUser) {
            return { success: false, error: 'Target user not found' };
        }
        if (targetUser.id == channel.owner) {
            return { success: false, error: 'Cannot kick owner' };
        }
        if (!channel.users.includes(targetUser.id)) {
            return { success: false, error: 'Target user is not in this channel' };
        }
        if (channel.admins.includes(targetUser.id)) {
            if (channel.admins.includes(user.id))
                return { success: false, error: 'Cannot kick another admin' };
            else if (channel.owner == user.id) {
                await this.prismaService.channel.update({
                    where: { channelName: body.channelName },
                    data: {
                        users: {
                            set: channel.users.filter((id) => id != targetUser.id),
                        },
                    },
                });
                return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
            }
            else
                return { success: false, error: 'You are not admin' };
        }
        await this.prismaService.channel.update({
            where: { channelName: body.channelName },
            data: {
                users: {
                    set: channel.users.filter((id) => id != targetUser.id),
                },
            },
        });
        return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    }

    async banUserChannel(body: { username: string; accessToken: string; refreshToken: string; channelName: string; targetUsername: string; }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: body.channelName },
            select: {
                users: true,
                owner: true,
                admins: true,
                bannedIds: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (channel.owner != user.id && !channel.admins.includes(user.id)) {
            return { success: false, error: 'You are not admin' };
        }
        const targetUser = await this.prismaService.user.findUnique({ where: { username: body.targetUsername } });
        if (!targetUser) {
            return { success: false, error: 'Target user not found' };
        }
        if (targetUser.id == channel.owner) {
            return { success: false, error: 'Cannot ban owner' };
        }
        if (!channel.users.includes(targetUser.id)) {
            return { success: false, error: 'Target user is not in this channel' };
        }
        if (channel.admins.includes(targetUser.id)) {
            if (channel.admins.includes(user.id))
                return { success: false, error: 'Cannot ban another admin' };
            else if (channel.owner == user.id) {
                await this.prismaService.channel.update({
                    where: { channelName: body.channelName },
                    data: {
                        users: {
                            set: channel.users.filter((id) => id != targetUser.id),
                        },
                        bannedIds: {
                            set: [...channel.bannedIds, targetUser.id],
                        },
                    },
                });
                return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
            }
            else
                return { success: false, error: 'You are not admin' };
        }
        await this.prismaService.channel.update({
            where: { channelName: body.channelName },
            data: {
                users: {
                    set: channel.users.filter((id) => id != targetUser.id),
                },
                bannedIds: {
                    set: [...channel.bannedIds, targetUser.id],
                },
            },
        });
        return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    }

    async muteUserChannel(body: { username: string; accessToken: string; refreshToken: string; channelName: string; targetUsername: string, duration: number }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: body.channelName },
            select: {
                users: true,
                owner: true,
                admins: true,
                mutedIds: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (channel.owner != user.id && !channel.admins.includes(user.id)) {
            return { success: false, error: 'You are not admin' };
        }
        const targetUser = await this.prismaService.user.findUnique({ where: { username: body.targetUsername } });
        if (!targetUser) {
            return { success: false, error: 'Target user not found' };
        }
        if (targetUser.id == channel.owner) {
            return { success: false, error: 'Cannot mute owner' };
        }
        if (!channel.users.includes(targetUser.id)) {
            return { success: false, error: 'Target user is not in this channel' };
        }
        if (channel.admins.includes(targetUser.id)) {
            if (channel.admins.includes(user.id))
                return { success: false, error: 'Cannot mute another admin' };
            else if (channel.owner == user.id) {
                await this.prismaService.channel.update({
                    where: { channelName: body.channelName },
                    data: {
                        mutedIds: {
                            set: [...channel.mutedIds, targetUser.id],
                        },
                    },
                });
                setTimeout(async () => {
                    await this.prismaService.channel.update({
                        where: { channelName: body.channelName },
                        data: {
                            mutedIds: {
                                set: channel.mutedIds.filter((id) => id != targetUser.id),
                            },
                        },
                    });
                }, body.duration * 1000);
                return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
            }
            else
                return { success: false, error: 'You are not admin' };
        }
        await this.prismaService.channel.update({
            where: { channelName: body.channelName },
            data: {
                mutedIds: {
                    set: [...channel.mutedIds, targetUser.id],
                },
            },
        });
        setTimeout(async () => {
            await this.prismaService.channel.update({
                where: { channelName: body.channelName },
                data: {
                    mutedIds: {
                        set: channel.mutedIds.filter((id) => id != targetUser.id),
                    },
                },
            });
        }, body.duration * 1000);
        return
    }

    async changePasswordChannel(body: { username: string; newPassword: string; accessToken: string; refreshToken: string; channelName: string; }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: body.channelName },
            select: {
                owner: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (channel.owner != user.id) {
            return { success: false, error: 'You are not owner' };
        }
        await this.prismaService.channel.update({
            where: { channelName: body.channelName },
            data: {
                password: body.newPassword,
            },
        });
        return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    }


    async inviteUserChannel(body: { username: string; accessToken: string; refreshToken: string; channelName: string; invitedUser: string; }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: body.channelName },
            select: {
                owner: true,
                admins: true,
                users: true,
                bannedIds: true,
                pendingIds: true,
                id: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (channel.owner != user.id && !channel.admins.includes(user.id)) {
            return { success: false, error: 'You are not admin' };
        }
        const invitedUser = await this.prismaService.user.findUnique({ where: { username: body.invitedUser } });
        if (!invitedUser) {
            return { success: false, error: 'Invited user not found' };
        }
        if (channel.users.includes(invitedUser.id)) {
            return { success: false, error: 'User is already in this channel' };
        }
        if (channel.bannedIds.includes(invitedUser.id))
            return { success: false, error: 'User is banned from this channel' };
        if (channel.pendingIds.includes(invitedUser.id))
            return { success: false, error: 'User is already invited' };
        await this.prismaService.channel.update({
            where: { channelName: body.channelName },
            data: {
                pendingIds: {
                    set: [...channel.pendingIds, invitedUser.id],
                },
            },
        });
        await this.prismaService.user.update({
            where: { username: body.invitedUser },
            data: {
                channelRequests: {
                    set: [...invitedUser.channelRequests, channel.id],
                },
            },
        });
        return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    }


    async getChannelInvites(body: { username: string; accessToken: string; refreshToken: string; }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        let channelInvites = [];
        for (let i = 0; i < user.channelRequests.length; i++) {
            const channel = await this.prismaService.channel.findUnique({
                where: { id: user.channelRequests[i] },
                select: {
                    channelName: true,
                },
            });
            channelInvites.push({ channelName: channel.channelName });
        }
        return { success: true, channelInvites: channelInvites, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
    }


    async acceptChannelInvite(body: { username: string; accessToken: string; refreshToken: string; channelName: string; }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: body.channelName },
            select: {
                pendingIds: true,
                users: true,
                id: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (!channel.pendingIds.includes(user.id)) {
            return { success: false, error: 'You are not invited to this channel' };
        }
        await this.prismaService.channel.update({
            where: { channelName: body.channelName },
            data: {
                pendingIds: {
                    set: channel.pendingIds.filter((id) => id != user.id),
                },
                users: {
                    set: [...channel.users, user.id],
                },
            },
        });
        await this.prismaService.user.update({
            where: { username: body.username },
            data: {
                channelRequests: {
                    set: user.channelRequests.filter((id) => id != channel.id),
                },
            },
        });
    }


    async declineChannelInvite(body: { username: string; accessToken: string; refreshToken: string; channelName: string; }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: body.channelName },
            select: {
                pendingIds: true,
                id: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (!channel.pendingIds.includes(user.id)) {
            return { success: false, error: 'You are not invited to this channel' };
        }
        await this.prismaService.channel.update({
            where: { channelName: body.channelName },
            data: {
                pendingIds: {
                    set: channel.pendingIds.filter((id) => id != user.id),
                },
            },
        });
        await this.prismaService.user.update({
            where: { username: body.username },
            data: {
                channelRequests: {
                    set: user.channelRequests.filter((id) => id != channel.id),
                },
            },
        });
    }


    async promoteUserChannel(body: { username: string; accessToken: string; refreshToken: string; channelName: string; targetUsername: string; }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: body.channelName },
            select: {
                users: true,
                owner: true,
                admins: true,
                id: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (user.id != channel.owner) {
            return { success: false, error: 'You are not the owner of this channel' };
        }
        const targetUser = await this.prismaService.user.findUnique({ where: { username: body.targetUsername } });
        if (!targetUser) {
            return { success: false, error: 'Target user not found' };
        }
        if (!channel.users.includes(targetUser.id)) {
            return { success: false, error: 'Target user is not a member of this channel' };
        }
        if (channel.admins.includes(targetUser.id)) {
            return { success: false, error: 'Target user is already an admin of this channel' };
        }
        await this.prismaService.channel.update({
            where: { channelName: body.channelName },
            data: {
                admins: {
                    set: [...channel.admins, targetUser.id],
                },
            },
        });
        return ({ success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken });
    }


    async demoteUserChannel(body: { username: string; accessToken: string; refreshToken: string; channelName: string; targetUsername: string; }) {
        const user = await this.prismaService.user.findUnique({ where: { username: body.username } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const ret = await this.authService.checkToken(user, body.refreshToken, body.accessToken);
        if (ret.success == false)
            return { success: false, error: 'Invalid token' };
        const channel = await this.prismaService.channel.findUnique({
            where: { channelName: body.channelName },
            select: {
                users: true,
                owner: true,
                admins: true,
                id: true,
            },
        });
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (user.id != channel.owner) {
            return { success: false, error: 'You are not the owner of this channel' };
        }
        const targetUser = await this.prismaService.user.findUnique({ where: { username: body.targetUsername } });
        if (!targetUser) {
            return { success: false, error: 'Target user not found' };
        }
        if (!channel.users.includes(targetUser.id)) {
            return { success: false, error: 'Target user is not a member of this channel' };
        }
        if (!channel.admins.includes(targetUser.id)) {
            return { success: false, error: 'Target user is not an admin of this channel' };
        }
        await this.prismaService.channel.update({
            where: { channelName: body.channelName },
            data: {
                admins: {
                    set: channel.admins.filter((id) => id != targetUser.id),
                },
            },
        });
        return ({ success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken });
    }
}