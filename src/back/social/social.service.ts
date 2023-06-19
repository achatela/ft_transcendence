import { Injectable } from '@nestjs/common';
import { connect } from 'http2';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class SocialService {
    constructor(private prismaService: PrismaService, private authService: AuthService) { }

    async removeFriend(removerUsername: string, removedUsername: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        const remover = await this.prismaService.user.findUnique({ where: { username: removerUsername }, include: {friends: true} });
        const auth = await this.authService.checkToken(remover, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const removed = await this.prismaService.user.findUnique({ where: { username: removedUsername }, include: {friends: true} });
        await this.prismaService.user.update({
            where: { username: removerUsername },
            data: {
                friends: {
                    delete: { id: removed.id }
                },
            },
        });
        await this.prismaService.user.update({
            where: { username: removedUsername },
            data: {
                friends: {
                    delete: { id: remover.id }
                },
            },
        });
          
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
    }

    async acceptFriendRequest(accepterUsername: string, acceptedUsername: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        const accepter = await this.prismaService.user.findUnique({ where: { username: accepterUsername }, include: {friends: true} });
        const auth = await this.authService.checkToken(accepter, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const accepted = await this.prismaService.user.findUnique({ where: { username: acceptedUsername }, include: {friends: true} });
        const room = "friendChat(" + String(accepter.id) + "," + String(accepted.id) + ")";
        const chat = await this.prismaService.friendChat.create({
            data: {
                room: room
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
              friendRequests: {set: accepter.friendRequests.filter((requesterId) => requesterId !== accepted.id)}
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
        await this.prismaService.user.update({ where: { id: decliner.id }, data: { friendRequests: {set: decliner.friendRequests.filter((requesterId) => requesterId !== declined.id)} } });
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken };
    }

    async sendFriendRequest(requesterUsername: string, requestedUsername: string, accessToken: string, refreshToken: string): Promise<{ error?: string, success: boolean, accessToken?: string, refreshToken?: string }> {
        const requester = await this.prismaService.user.findUnique({ where: { username: requesterUsername }, include: {friends: true} });
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
            friendRequests.push((await this.prismaService.user.findUnique({ where: { id: requestId }, select: {username: true} })).username);
        console.log("friend requests", friendRequests);
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken, friendRequests: friendRequests };
    }

    async getFriends(username: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, friends?: string[] }> {
        const user = await this.prismaService.user.findUnique({ where: { username: username } , include: { friends: true }});
        const auth = await this.authService.checkToken(user, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const friends = [];
        for (const friend of user.friends)
            friends.push((await this.prismaService.user.findUnique({ where: { id: friend.friendId } })).username);
        return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken, friends: friends };
    }

    async getFriendChat(username: string, friendUsername: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, chat?: {room: string, messages: string[]} }> {
        const user = await this.prismaService.user.findUnique({ where: { username: username }, include: { friends: true }});
        const auth = await this.authService.checkToken(user, refreshToken, accessToken);
        if (auth.success == false)
            return { success: false };
        const friendId = (await this.prismaService.user.findUnique({ where: { username: friendUsername }, select: { id: true }})).id;
        const messages = [];
        for (const friend of user.friends) {
            if (friend.friendId == friendId) {
                const chat = await this.prismaService.friendChat.findUnique({ where: { id: friend.chatId }, include: { messages: true } })
                for (const message of chat.messages)
                    messages.push(message.text)
                console.log("messages", messages);
                return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken, chat: {room: chat.room, messages: messages} };
            }
        }
    }


    // async getFriendId(username: string, friendId: number, refreshToken: string, accessToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, id?: number }> {
    //     try {
    //         const user = await this.prismaService.user.findUnique({ where: { id: userId } });
    //         const auth = await this.authService.checkToken(user, refreshToken, accessToken);
    //         if (auth.success == false)
    //             return { success: false };
    //         const user2 = await this.prismaService.user.findUnique({ where: { id: friendId } });
    //         return { success: true, accessToken: auth.accessToken, refreshToken: auth.refreshToken, id: user2.id };
    //     } catch (error) {
    //         console.error('Error in getFriendId:', error);
    //     }
    // }
}