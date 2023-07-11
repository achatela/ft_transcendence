import { Injectable } from '@nestjs/common';
import { connect } from 'http2';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class SocialService {
    constructor(private prismaService: PrismaService, private authService: AuthService) { }

    async getStatus(username: string): Promise<{ success: boolean, status?: string }> {
        const user = await this.prismaService.user.findUnique({ where: { username: username }, select: { status: true } });
        if (user == null)
            return { success: false };
        return { success: true, status: user.status };
    }

    async getAvatar(username: string): Promise<{ success: boolean, avatar?: string }> {
        const user = await this.prismaService.user.findUnique({ where: { username: username }, select: { avatar: true } });
        if (user == null)
            return { success: false };
        return { success: true, avatar: user.avatar };
    }

    async removeFriend(removerUsername: string, removedUsername: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        const remover = await this.prismaService.user.findUnique({ where: { username: removerUsername }, include: { friends: true } });
        const auth = await this.authService.checkToken(remover, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const removed = await this.prismaService.user.findUnique({ where: { username: removedUsername }, include: { friends: true } });
        const friend = await remover.friends.find((friend) => friend.friendId == removed.id);
        const friend2 = await removed.friends.find((friend) => friend.friendId == remover.id);
        console.log("friend:", friend);
        console.log("friend2:", friend2);
        if (friend == undefined || friend2 == undefined)
            return { success: false };

        await this.prismaService.friend.delete({ where: { id: friend.id } });
        await this.prismaService.friend.delete({ where: { id: friend2.id } });

        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
    }

    async acceptFriendRequest(accepterUsername: string, acceptedUsername: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        const accepter = await this.prismaService.user.findUnique({ where: { username: accepterUsername }, include: { friends: true } });
        const auth = await this.authService.checkToken(accepter, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const accepted = await this.prismaService.user.findUnique({ where: { username: acceptedUsername }, include: { friends: true } });
        const roomName = "friendChat(" + String(accepter.id) + "," + String(accepted.id) + ")";
        let room = await this.prismaService.friendChat.findUnique({ where: { room: roomName } });
        if (room != null) {
            // Delete related FriendMessage records
            await this.prismaService.friendMessage.deleteMany({ where: { chatId: room.id } });

            // Delete the friendChat record
            await this.prismaService.friendChat.deleteMany({ where: { room: roomName } });
        }

        const chat = await this.prismaService.friendChat.create({
            data: {
                room: roomName
            }
        })
        await this.prismaService.user.update({
            where: { username: accepterUsername },
            data: {
                friends: {
                    create: {
                        friendId: accepted.id,
                        chatId: chat.id
                    }
                },
                friendRequests: { set: accepter.friendRequests.filter((requesterId) => requesterId !== accepted.id) }
            },
        });
        await this.prismaService.user.update({
            where: { username: acceptedUsername },
            data: {
                friends: {
                    create: {
                        friendId: accepter.id,
                        chatId: chat.id
                    }
                },
            },
        });
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
    }

    async declineFriendRequest(declinerUsername: string, declinedUsername: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        const decliner = await this.prismaService.user.findUnique({ where: { username: declinerUsername } });
        const auth = await this.authService.checkToken(decliner, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const declined = await this.prismaService.user.findUnique({ where: { username: declinedUsername }, select: { id: true } });
        await this.prismaService.user.update({ where: { id: decliner.id }, data: { friendRequests: { set: decliner.friendRequests.filter((requesterId) => requesterId !== declined.id) } } });
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
    }

    async sendFriendRequest(requesterUsername: string, requestedUsername: string, accessToken: string, refreshToken: string): Promise<{ error?: string, success: boolean, accessToken?: string, refreshToken?: string }> {
        if (requesterUsername == requestedUsername)
            return { error: "You can't send friend request to yourself.", success: false };
        const requester = await this.prismaService.user.findUnique({ where: { username: requesterUsername }, include: { friends: true } });
        const auth = await this.authService.checkToken(requester, refreshToken, accessToken);
        if (auth.success == false)
            return { error: "User not found.", success: false };
        const requested = await this.prismaService.user.findUnique({ where: { username: requestedUsername } });
        for (const request of requester.friendRequests) {
            if (request == requested.id)
                return { error: "Friend request already sent to this user.", success: false, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
        }
        for (const friend of requester.friends) {
            if (friend.friendId == requested.id)
                return { error: "User already in friend list.", success: false, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
        }
        if (requester.blockedIds.includes(requested.id)) {
            // remove from blockedIds
            await this.prismaService.user.update({ where: { username: requesterUsername }, data: { blockedIds: { set: requester.blockedIds.filter((blockedId) => blockedId !== requested.id) } } });
            if (requested.blockedIds.includes(requester.id)) {
                return { error: "Remove from block list, but user blocked you.", success: false, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
            }
            await this.prismaService.user.update({ where: { username: requestedUsername }, data: { friendRequests: { push: requester.id } } });
            return { error: "Sent and remove from blocked list.", success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
        }
        if (requested.blockedIds.includes(requester.id)) {
            return { error: "User blocked you.", success: false, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
        }

        await this.prismaService.user.update({ where: { username: requestedUsername }, data: { friendRequests: { push: requester.id } } });
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
    }

    async getFriendRequests(username: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, friendRequests?: string[] }> {
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        const auth = await this.authService.checkToken(user, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const friendRequests = [];
        for (const requestId of user.friendRequests)
            friendRequests.push((await this.prismaService.user.findUnique({ where: { id: requestId }, select: { username: true } })).username);
        console.log("friend requests", friendRequests);
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken, friendRequests: friendRequests };
    }

    async getFriends(username: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, friends?: string[] }> {
        const user = await this.prismaService.user.findUnique({ where: { username: username }, include: { friends: true } });
        const auth = await this.authService.checkToken(user, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const friends = [];
        for (const friend of user.friends)
            friends.push((await this.prismaService.user.findUnique({ where: { id: friend.friendId } })).username);
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken, friends: friends };
    }

    async getFriendChat(username: string, friendUsername: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, chat?: { room: string, messages: any[] } }> {
        const user = await this.prismaService.user.findUnique({ where: { username: username }, include: { friends: true } });
        const auth = await this.authService.checkToken(user, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const friendId = (await this.prismaService.user.findUnique({ where: { username: friendUsername }, select: { id: true } })).id;
        const messages = [];
        for (const friend of user.friends) {
            if (friend.friendId == friendId) {
                const chat = await this.prismaService.friendChat.findUnique({ where: { id: friend.chatId }, include: { messages: true } })
                for (const message of chat.messages) {
                    let user = await this.prismaService.user.findUnique({ where: { id: message.senderId }, select: { username: true, avatar: true } });
                    messages.push({ senderId: message.senderId, text: message.text, time: message.createdAt, username: user.username, avatar: user.avatar })
                }
                console.log("messages", messages);
                return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken, chat: { room: chat.room, messages: messages } };
            }
        }
    }

    async getFriendId(username: string, friendUsername: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, id?: number }> {
        try {
            const user = await this.prismaService.user.findUnique({ where: { username: username } });
            const auth = await this.authService.checkToken(user, refreshToken, accessToken);
            if (auth.success == false) {
                return { success: false };
            }
            const friendId = (await this.prismaService.user.findUnique({ where: { username: friendUsername }, select: { id: true } })).id;
            return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken, id: friendId };
        } catch (error) {
            console.error('Error in getFriendId:', error);
        }
    }

    async blockedIds(body: { username: string, accessToken: string, refreshToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, blockedIds?: number[], error?: string }> {
        const { username, accessToken, refreshToken } = body;
        const user = await this.prismaService.user.findUnique({ where: { username: username } })
        if (!user) {
            return { success: false, error: "User not found" };
        }
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (!ret) {
            return { success: false, error: "Token not valid" };
        }
        return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, blockedIds: user.blockedIds };
    }

    async blockUser(body: { username: string, blockedUsername: string, accessToken: string; refreshToken: string }): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, error?: string }> {
        const { username, blockedUsername, accessToken, refreshToken } = body;
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        if (user == null)
            return { success: false, error: "User not found" };
        const auth = await this.authService.checkToken(user, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false, error: "Invalid token" };
        const blockedUser = await this.prismaService.user.findUnique({ where: { username: blockedUsername } });
        if (blockedUser == null)
            return { success: false, error: "Blocked user not found" };
        const ret = await this.prismaService.friend.findFirst({ where: { userId: user.id, friendId: blockedUser.id } })
        if (ret != null) {
            await this.prismaService.friend.deleteMany({ where: { userId: user.id, friendId: blockedUser.id } })
            await this.prismaService.friend.deleteMany({ where: { userId: blockedUser.id, friendId: user.id } })
        }
        let tmp = user.blockedIds;
        for (let i = 0; i < user.blockedIds.length; i++) {
            if (tmp[i] == blockedUser.id)
                return ({ success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken })
        }
        await this.prismaService.user.update({
            where: { username: username },
            data: {
                blockedIds: {
                    push: blockedUser.id
                }
            }
        });
        if (blockedUser.friendRequests.includes(user.id)) {
            await this.prismaService.user.update({
                where: { username: blockedUsername },
                data: {
                    friendRequests: {
                        set: blockedUser.friendRequests.filter((requesterId) => requesterId !== user.id)
                    }
                }
            });
        }
        if (user.friendRequests.includes(blockedUser.id)) {
            await this.prismaService.user.update({
                where: { username: username },
                data: {
                    friendRequests: {
                        set: user.friendRequests.filter((requesterId) => requesterId !== blockedUser.id)
                    }
                }
            });
        }
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
    }
}