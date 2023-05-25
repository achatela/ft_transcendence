import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
const jwt = require('jsonwebtoken');


@Injectable()
export class AuthService {
    tokenApp: string;
    countdown: number;

    constructor(private prismaService: PrismaService, private jwtService: JwtService) {
        this.init();
    }

    async init() {
        const answer = await this.getToken();
        this.tokenApp = answer.access_token;
        this.countdown = answer.expires_in;

        setTimeout(() => this.refresh(), this.countdown * 1000);
    }

    async refresh() {
        const answer = await this.getToken();
        this.tokenApp = answer.access_token;
        this.countdown = answer.expires_in;
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
            redirect_uri: "http://localhost:3133"
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
            console.log(token, tokenExpires);
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
            redirect_uri: "http://localhost:3133",
        });

        return (`https://api.intra.42.fr/oauth/authorize?response_type=code&` + queryParams.toString())
    }

    // async checkToken(user: User, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
    //     if (user.accessToken === accessToken) {
    //         const accessTokenExp = jwt.decode(accessToken).exp * 1000;
    //         const currentTime = new Date().getTime();
    //         if (accessTokenExp < currentTime) {
    //             const payload = {username: user.username, id: user.id};
    //             accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '5m' });
    //             await this.prismaService.user.update({ where: { username: user.username }, data: { accessToken: accessToken } });
    //         }
    //         return {success: true, refreshToken: refreshToken, accessToken: accessToken};
    //     }
    //     return {success: false};
    // }


    async checkToken(user: User, refreshToken: string, accessToken: string): Promise<{ success: boolean, refreshToken?: string, accessToken?: string }> {
        if (user.accessToken === accessToken) {
            try {
                await this.jwtService.verify(accessToken, { secret: process.env.JWT_ACCESS_SECRET });
            }
            catch {
                if (user.refreshToken === refreshToken) {
                    const payload = { username: user.username, id: user.id };
                    accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '5m' });
                    await this.prismaService.user.update({ where: { username: user.username }, data: { accessToken: accessToken } });
                    try {
                        await this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
                    }
                    catch {
                        refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '10d' });
                        await this.prismaService.user.update({ where: { username: user.username }, data: { refreshToken: refreshToken } });
                        return { success: true, refreshToken: refreshToken, accessToken: accessToken };
                    }
                    return { success: true, refreshToken: refreshToken, accessToken: accessToken };
                }
                return { success: false };
            }
            return { success: true, refreshToken: refreshToken, accessToken: accessToken };
        }
        return { success: false };
    }
}