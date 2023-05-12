import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private prismaService: PrismaService, private jwtService: JwtService) {}
    @Post('redirect')
    async getRedirectUrl(@Body() userInput: { username: string }): Promise<any> {
        try {
            await this.prismaService.user.findUniqueOrThrow({ where: { username: userInput.username } })
        }
        catch {
            const redirectUrl = this.authService.redirectUrl(userInput.username);
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
    async getCode(@Body() userInput: { code: string, username: string}): Promise<{success: boolean, error?: string, jwt?: string}> {
        const personnal42Token = await this.authService.getUserToken(userInput.code);
        if (personnal42Token.success === false)
            return {success: false, error: "getUserToken failure"};
        this.prismaService.user.update({ where: { username: userInput.username }, data: { personnal42Token: personnal42Token.access_token } });
        const user = await this.prismaService.user.findUnique({where: {username: userInput.username}});
        const payload = {username: userInput.username, id: user.id};
        const signature = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
        this.prismaService.user.update({ where: { username: userInput.username }, data: { JwtToken: signature } });
        console.log(signature);
        // Create a JWT Token
        // const jwtToken = this.authService.user.createJwtToken(userInput.username);
            
        // Get avatar from 42 API
        const request = await axios.get("https://api.intra.42.fr/v2/me", { headers: { Authorization: `Bearer ${personnal42Token.access_token}` } });
        const avatar = request.data.image.versions.small;
        this.prismaService.user.update({ where: { username: userInput.username }, data: { avatar: avatar } });
        console.log("avatar = ", avatar);
        return {success: true, jwt: signature};
    }
}
