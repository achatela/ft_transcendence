import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SocialService {
    constructor(private prismaService: PrismaService, private authService: AuthService) { }

    async getFriendRequest(login: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, listRequest?: string[] }> {
        const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (ret.success == true) {
            const idList = user.idFriendsRequests;
            const listRequest = [];
            for (const id of idList) {
                const user = await this.prismaService.user.findUniqueOrThrow({ where: { id: id } });
                listRequest.push(user.username);
            }
            console.log("list request", listRequest);
            return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, listRequest: listRequest };
        }
        return { success: false };
    }

    async acceptFriendRequest(usernameToAccept: string, loginUser: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        const user1 = await this.prismaService.user.findUniqueOrThrow({ where: { login: loginUser } });
        const user2 = await this.prismaService.user.findUniqueOrThrow({ where: { username: usernameToAccept } });
        const ret = await this.authService.checkToken(user1, refreshToken, accessToken);
        if (ret.success == true) {
            const idList = user1.idFriendsList;
            idList.push(user2.id);
            await this.prismaService.user.update({ where: { login: loginUser }, data: { idFriendsList: idList } });
            const idList2 = user2.idFriendsList;
            idList2.push(user1.id);
            await this.prismaService.user.update({ where: { username: usernameToAccept }, data: { idFriendsList: idList2 } });
            const idList3 = user1.idFriendsRequests;
            const index = idList3.indexOf(user2.id);
            idList3.splice(index, 1);
            await this.prismaService.user.update({ where: { login: loginUser }, data: { idFriendsRequests: idList3 } });
            return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
        }
        return { success: false };
    }

    async declineFriendRequest(usernameToDecline: string, loginUser: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        const user1 = await this.prismaService.user.findUniqueOrThrow({ where: { login: loginUser } });
        const user2 = await this.prismaService.user.findUniqueOrThrow({ where: { username: usernameToDecline } });
        const ret = await this.authService.checkToken(user1, refreshToken, accessToken);
        if (ret.success == true) {
            const idList = user1.idFriendsRequests;
            const index = idList.indexOf(user2.id);
            idList.splice(index, 1);
            await this.prismaService.user.update({ where: { login: loginUser }, data: { idFriendsRequests: idList } });
            return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
        }
        return { success: false };
    }

    async getFriendList(login: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string, listFriend?: string[] }> {
        const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (ret.success == true) {
            const idList = user.idFriendsList;
            const listFriend = [];
            for (const id of idList) {
                const userTmp = await this.prismaService.user.findUniqueOrThrow({ where: { id: id } });
                listFriend.push(userTmp.username);
            }
            console.log("list friend", listFriend);
            return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, listFriend: listFriend };
        }
        return { success: false };
    }

    async sendFriendRequest(login: string, accessToken: string, refreshToken: string, usernameToRequest: string): Promise<{ error?: string, success: boolean, accessToken?: string, refreshToken?: string }> {
        //Change error to be: "User not found" or "User already in friend list"
        try {
            const user1 = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
            const user2 = await this.prismaService.user.findUniqueOrThrow({ where: { username: usernameToRequest } });
            const ret = await this.authService.checkToken(user1, refreshToken, accessToken);

            if (ret.success == true) {
                // check if user2 is already in friend list
                const idCheck = user1.idFriendsList;
                for (const id of idCheck) {
                    if (id == user2.id) {
                        return { error: "User already in friend list.", success: false, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
                    }
                }
                const idList = user2.idFriendsRequests;
                idList.push(user1.id);
                await this.prismaService.user.update({ where: { username: usernameToRequest }, data: { idFriendsRequests: idList } });
                return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
            }
        } catch (error) {
            console.error('Error in sendFriendRequest:', error);
        }
        return { error: "User not found.", success: false };
    }

    async removeFriend(usernameToRemove: string, loginUser: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        try {
            const user1 = await this.prismaService.user.findUniqueOrThrow({ where: { login: loginUser } });
            const user2 = await this.prismaService.user.findUniqueOrThrow({ where: { username: usernameToRemove } });
            const ret = await this.authService.checkToken(user1, refreshToken, accessToken);
            if (ret.success == true) {
                const idList = user1.idFriendsList;
                const index = idList.indexOf(user2.id);
                idList.splice(index, 1);
                await this.prismaService.user.update({ where: { login: loginUser }, data: { idFriendsList: idList } });
                const idList2 = user2.idFriendsList;
                const index2 = idList2.indexOf(user1.id);
                idList2.splice(index2, 1);
                await this.prismaService.user.update({ where: { username: usernameToRemove }, data: { idFriendsList: idList2 } });
                return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
            }
        }
        catch (error) {
            console.error('Error in removeFriend:', error);
        }
        return { success: false };
    }
}