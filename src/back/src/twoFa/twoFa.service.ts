import { Injectable } from '@nestjs/common';
import * as speakeasy from 'node-2fa';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class twoFaService {
    constructor(private authService: AuthService, private prismaService: PrismaService) {}

    async create2Fa(login: string, accessToken: string, refreshToken: string): Promise<void> {
        try{
            const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
            const secret = speakeasy.generateSecret({account: "ft_transcendence" , name: '42'})
            // const ret = await this.authService.checkToken(user, refreshToken, accessToken);
            // if (ret.success == true) {
                await this.prismaService.user.update({ where: { login: login }, data: { secret2FA: secret.secret } });
            // }
            console.log(secret);
        }
        catch (e) {
            console.log("Error while creating 2FA");
        }
        return ;
    }

    async verify2Fa(token: number, login: string): Promise<void> {
        console.log("token", token, "login", login);
        try {
            // Use verifyToken to check if the token is valid
            const user = await this.prismaService.user.findUniqueOrThrow({ where: { login: login } });
            const secret = user.secret2FA;
            const verified = speakeasy.verifyToken(secret, 'base32', token);
            console.log(verified);
        }
        catch (e) {
            console.log("Error while verifying 2FA", e);
        }
        return ;
    }
}
