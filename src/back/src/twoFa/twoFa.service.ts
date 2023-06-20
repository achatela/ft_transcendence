import { Injectable } from '@nestjs/common';
import * as node2fa from 'node-2fa';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class twoFaService {
    constructor(private authService: AuthService, private prismaService: PrismaService) { }

    async create2Fa(login: string, accessToken: string, refreshToken: string): Promise<{ success: boolean, accessToken: string, refreshToken: string }> {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: login } });
            const secret = node2fa.generateSecret({ account: "ft_transcendence", name: '42' })
            const ret = await this.authService.checkToken(user, refreshToken, accessToken);
            if (ret.success == true) {
                await this.prismaService.user.update({ where: { username: login }, data: { enabled2FA: true, secret2FA: secret.secret, qrCode2FA: secret.qr } });
                return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
            }
        }
        catch (e) {
            console.log("Error while creating 2FA");
        }
        return;
    }

    async verify2Fa(token: string, login: string): Promise<{ success: boolean, accessToken?: string, refreshToken?: string }> {
        try {
            // Use verifyToken to check if the token is valid
            const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: login } });
            const secret = user.secret2FA;
            const verified = node2fa.verifyToken(secret, token);
            if (verified != null && verified.delta == 0) {
                const ret = await this.authService.checkToken(user, user.refreshToken, user.accessToken);
                if (ret.success == true) {
                    // await this.prismaService.user.update({ where: { username: login }, data: { secret2FA: null } });
                    return { success: true, accessToken: ret.accessToken, refreshToken: ret.refreshToken };
                }
                return { success: false };
            }
            return { success: false };
        }
        catch (e) {
            console.log("Error while verifying 2FA");
        }
        return { success: false };
    }

    async check2Fa(login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, qrCode?: string }> {
        // Check if the user has 2FA enabled
        try {
            // console.log("username = ", login);
            const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: login } });
            if (user.enabled2FA === true) {
                const ret = await this.authService.checkToken(user, refreshToken, accessToken);
                if (ret.success == true) {
                    return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken, qrCode: user.qrCode2FA };
                }
                return { success: false };
            }
            return { success: false };
        }
        catch (e) {
            console.log("Error while checking 2FA");
        }
        return { success: false };
    }

    async disable2Fa(login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: login } });
            const ret = await this.authService.checkToken(user, refreshToken, accessToken);
            if (ret.success == true) {
                await this.prismaService.user.update({ where: { username: login }, data: { enabled2FA: false, secret2FA: null } });
                return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken };
            }
            return { success: false };
        }
        catch (e) {
            console.log("Error while disabling 2FA");
        }
        return { success: false };
    }

    async getQr(login: string, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string, qrCode?: string }> {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({ where: { username: login } });
            const ret = await this.authService.checkToken(user, refreshToken, accessToken);
            if (ret.success == true) {
                return { success: true, refreshToken: ret.refreshToken, accessToken: ret.accessToken, qrCode: user.qrCode2FA };
            }
            return { success: false };
        }
        catch (e) {
            console.log("Error while getting QR code");
        }
        return { success: false };
    }
}
