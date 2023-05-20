import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SocialService {
    constructor(private prismaService: PrismaService, private authService: AuthService) {}
        
    async getFriendRequest(login: string, accessToken: string, refreshToken: string): Promise<{success: boolean, accessToken?: string, refreshToken?: string, listRequest?: string[]}> {
        const user = await this.prismaService.user.findUnique({ where: { login: login } });
        const ret = await this.authService.checkToken(user, refreshToken, accessToken);
        if (ret.success == true) {
            const idList = user.idFriendsRequests;
            const listRequest = [];
            for (const id of idList) {
                const user = await this.prismaService.user.findUnique({ where: { id: id } });
                listRequest.push(user.username);
            }
            console.log(listRequest);
            return {success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken, listRequest: listRequest};
        }
        return {success: false};
    }
}