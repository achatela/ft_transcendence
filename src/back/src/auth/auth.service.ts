import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');


@Injectable()
export class AuthService {
    async logOut(username: string, refreshToken: string, accessToken: string) {
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        if (!user)
            return ({ success: false, error: "user doesn't exist" });
        const ret = await this.checkToken(user, refreshToken, accessToken);
        if (ret.success == false)
            return ({ success: false, error: "invalid token" });
        await this.prismaService.user.update({ where: { username: username }, data: { status: "offline" } });
        return ({ success: true });
    }

    constructor(private prismaService: PrismaService, private jwtService: JwtService) {
    }

    async getVerifySignUp(username: string, password: string) {
        try {
            const user = await this.prismaService.createUser({ username: username });
            const payload = { id: user.id };
            const accessToken: string = await this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '45m' });
            const refreshToken: string = await this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '10d' });
            await this.prismaService.user.update({ where: { username: username }, data: { avatar: 'http://' + process.env.HOST + ':3133/defaultPfp.png', hashedPassword: password, refreshToken: refreshToken, accessToken: accessToken } });
            return { success: true, username: username, accessToken: accessToken, refreshToken: refreshToken };
        }
        catch {
            return ({ success: false, error: "user already exist" });
        }
    }

    async getVerifySignIn(username: string, password: string) {
        const user = await this.prismaService.user.findUnique({ where: { username: username } });
        if (!user)
            return ({ success: false, error: "user doesn't exist" });
        if (!(await bcrypt.compare(password, user.hashedPassword)))
            return { success: false, error: "incorrect password" };
        return { success: true, username: username, accessToken: user.accessToken, refreshToken: user.refreshToken, twoFa: user.enabled2FA };
    }

    async getRedirectFortyTwo() {
        return { url: this.redirectUrl() };
    }

    async verifySignIn(code: string) {
        const personnal42Token = await this.getUserToken(code);
        if (personnal42Token.success === false)
            return { success: false, error: "getUserToken failure" };
        const request = await axios.get("https://api.intra.42.fr/v2/me", { headers: { Authorization: `Bearer ${personnal42Token.access_token}` } });
        let user = await this.prismaService.user.findUnique({ where: { login: request.data.login } });
        if (!user) {
            let username = request.data.login;
            if (await this.prismaService.user.findUnique({ where: { username: username } })) {
                let i = 1;
                while (await this.prismaService.user.findUnique({ where: { username: username + String(i) } }))
                    i++;
                username = username + String(i);
            }
            let user = await this.prismaService.createUser({ username: username, login: request.data.login, avatar: request.data.image.versions.small, personnal42Token: personnal42Token.access_token });
            const payload = { id: user.id };
            const accessToken: string = await this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '45m' });
            const refreshToken: string = await this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '10d' });
            user = await this.prismaService.user.update({ where: { username: username }, data: { accessToken: accessToken, refreshToken: refreshToken } });
            return {
                success: true,
                refreshToken: user.refreshToken,
                accessToken: user.accessToken,
                username: user.username,
                twoFa: user.enabled2FA,
            };
        }
        user = await this.prismaService.user.update({ where: { login: request.data.login }, data: { personnal42Token: personnal42Token.access_token } });
        return {
            success: true,
            refreshToken: user.refreshToken,
            accessToken: user.accessToken,
            username: user.username,
            twoFa: user.enabled2FA,
        };
    }

    async getToken(): Promise<any> {
        try {
            const response = await axios.post("https://api.intra.42.fr/oauth/token", {
                grant_type: 'client_credentials',
                client_id: process.env.FORTY_TWO_UID,
                client_secret: process.env.FORTY_TWO_SECRET
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching token:', error);
            throw error;
        }
    }


    async getUserToken(userCode: string): Promise<{ success: boolean, access_token?: string, expires_in?: string }> {
        const requestBody = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.FORTY_TWO_UID,
            client_secret: process.env.FORTY_TWO_SECRET,
            code: userCode,
            redirect_uri: "http://" + process.env.HOST + ":3133"
        });
        try {
            const request = await axios.post("https://api.intra.42.fr/oauth/token", requestBody.toString(), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            const data: any = request.data;
            const token = data.access_token;
            const tokenExpires = data.expires_in;
            // Create the user in the database
            return { success: true, access_token: token, expires_in: tokenExpires };
        }
        catch {
            console.error("in getUserToken catch");
            return { success: false };
        }
    }

    redirectUrl(): string {
        const queryParams = new URLSearchParams({
            client_id: process.env.FORTY_TWO_UID,
            redirect_uri: "http://" + process.env.HOST + ":3133"
        });

        return (`https://api.intra.42.fr/oauth/authorize?response_type=code&` + queryParams.toString())
    }

    async checkToken(user: User, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        if (user.accessToken === accessToken) {
            const userTmp = await this.prismaService.user.findUnique({ where: { id: user.id } });
            if (userTmp.status == "offline" || userTmp.status == "online")
                await this.prismaService.user.update({ where: { id: user.id }, data: { status: "online" } });
            try {
                await this.jwtService.verify(accessToken, { secret: process.env.JWT_ACCESS_SECRET });
            }
            catch {
                if (user.refreshToken === refreshToken) {
                    const payload = { id: user.id };
                    accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '45m' });
                    await this.prismaService.user.update({ where: { id: user.id }, data: { accessToken: accessToken } });
                    try {
                        await this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
                    }
                    catch {
                        refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '10d' });
                        await this.prismaService.user.update({ where: { id: user.id }, data: { refreshToken: refreshToken } });
                        setTimeout(async () => {
                            const userTmp = await this.prismaService.user.findUnique({ where: { id: payload.id } });
                            if (accessToken == userTmp.accessToken && userTmp.status == "online")
                                await this.prismaService.user.update({ where: { id: payload.id }, data: { status: "offline" } });
                            // 5 minutes
                        }, 300000);
                        return { success: true, refreshToken: refreshToken, accessToken: accessToken };
                    }
                    setTimeout(async () => {
                        if (accessToken == userTmp.accessToken && userTmp.status == "online")
                            await this.prismaService.user.update({ where: { id: payload.id }, data: { status: "offline" } });
                    }, 300000);
                    return { success: true, refreshToken: refreshToken, accessToken: accessToken };
                }
                return { success: false };
            }
            setTimeout(async () => {
                const userTmp = await this.prismaService.user.findUnique({ where: { id: user.id } });
                if (accessToken == userTmp.accessToken && userTmp.status == "online")
                    await this.prismaService.user.update({ where: { id: user.id }, data: { status: "offline" } });
            }, 300000);
            return { success: true, refreshToken: refreshToken, accessToken: accessToken };
        }
        return { success: false };
    }
}