import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private prismaService: PrismaService, private jwtService: JwtService) {}

    @Post('redirect')
    async getRedirectUrl(@Body() userInput: { username?: string }): Promise<{success: boolean, url?: string, error?: string}> {
        if (userInput.username === undefined){
            console.log(userInput.username, this.authService.redirectUrl())
            return {
                success: true,
                url: this.authService.redirectUrl(),
            }
        }
        try {
            await this.prismaService.user.findUniqueOrThrow({ where: { username: userInput.username } })
        }
        catch {
            const redirectUrl = this.authService.redirectUrl();
            this.prismaService.createUser( {username: userInput.username });
            return {
                success: true,
                url: redirectUrl,
            };
        }
        console.log("User", userInput.username, "already exists")
        return {
            success: false,
            error: "Username already exists",
        }
    }

    @Post('get_code')
    async getCode(@Body() userInput: { code: string, username: string}): Promise<{success: boolean, error?: string, refreshToken?: string, accessToken?: string, login?: string}> {
        const personnal42Token = await this.authService.getUserToken(userInput.code);
        if (personnal42Token.success === false)
            return {success: false, error: "getUserToken failure"};
        await this.prismaService.user.update({ where: { username: userInput.username }, data: { personnal42Token: personnal42Token.access_token } });
        const user = await this.prismaService.user.findUnique({where: {username: userInput.username}});
        const payload = {username: userInput.username, id: user.id};
        const refreshToken: string = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '100d' });
        const accessToken: string = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '60m' });
        await this.prismaService.user.update({ where: { username: userInput.username }, data: { refreshToken: refreshToken, accessToken: accessToken } });
        const request = await axios.get("https://api.intra.42.fr/v2/me", { headers: { Authorization: `Bearer ${personnal42Token.access_token}` } });
        try {
            await this.prismaService.user.findUniqueOrThrow({ where: { login: request.data.login } })
        }
        catch {
            await this.prismaService.user.update({ where: { username: userInput.username }, data: { avatar: request.data.image.versions.small } });
            await this.prismaService.user.update({ where: { username: userInput.username }, data: { login: request.data.login } });
            return {success: true, refreshToken: refreshToken, accessToken: accessToken, login: request.data.login};
        }
        await this.prismaService.user.delete({ where: { username: userInput.username } })
        return ({success: false, error: "Login already created a user"})
    }

    @Post('authorize_access')
    async authorizeAccess(@Body() userInput: { username: string, refreshToken: string, accessToken: string }): Promise<{success: boolean, error?: string}> {
        const user = await this.prismaService.user.findUnique({where: {username: userInput.username}});
        if (user.accessToken === userInput.accessToken) {
            const accessPayload = this.jwtService.verify(userInput.accessToken, { secret: process.env.JWT_ACCESS_SECRET });
            if (accessPayload.exp < Date.now() / 1000) {
                if (user.refreshToken === userInput.refreshToken) {
                    const payload = {username: user.username, id: user.id};
                    const refreshPayload = this.jwtService.verify(userInput.refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
                    if (refreshPayload.exp < Date.now() / 1000) {
                        const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '100d' });
                        await this.prismaService.user.update({ where: { username: user.username }, data: { refreshToken: refreshToken } });
                    }
                    const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '60m' });
                    await this.prismaService.user.update({ where: { username: user.username }, data: { accessToken: accessToken } });
                    return {success: true};
                }
                return {success: false, error: "Invalid JWT"};
            }
            return {success: true};
        }
        return {success: false, error: "Invalid JWT"};
    }

    @Post('verify_sign_in')
    async verifySignUp(@Body() userInput: { code: string }): Promise<{success: boolean, login?: string, error?: string, refreshToken?: string, accessToken?: string}> {
        const personnal42Token = await this.authService.getUserToken(userInput.code);
        if (personnal42Token.success === false)
            return {success: false, error: "getUserToken failure"};
        const request = await axios.get("https://api.intra.42.fr/v2/me", { headers: { Authorization: `Bearer ${personnal42Token.access_token}` } });
        try {
            await this.prismaService.user.findUniqueOrThrow({ where: { login: request.data.login } })
        }
        catch {
            return {success: false, error: "Login doesn't exists"};
        }
        await this.prismaService.user.update({ where: { login: request.data.login }, data: { personnal42Token: personnal42Token.access_token } });
        const user = await this.prismaService.user.findUnique({where: {login: request.data.login}});
        const payload = {username: user.username, id: user.id};
        const refreshToken: string = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '100d' });
        const accessToken: string = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '60m' });
        await this.prismaService.user.update({ where: { username: user.username }, data: { refreshToken: refreshToken, accessToken: accessToken } });
        return {
            success: true,
            refreshToken: refreshToken,
            accessToken: accessToken,
            login: request.data.login,
        };
    }
}
