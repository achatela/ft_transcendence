import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private prismaService: PrismaService) {}
    @Post('redirect')
    getRedirectUrl(@Body() userInput: { username: string }): any {
        

        console.log("username = ", userInput.username)
        const redirectUrl = this.authService.redirectUrl(userInput.username);// Check if username is already in database
        // Return error
        // return {
        //     success: false,
        //     error: "Username already exists",
        //     url: redirectUrl,
        // }

        // If the username is not in the database, create it
        this.prismaService.createUser( {username: userInput.username });

        return {
            success: true,
            url: redirectUrl,
        };
    }

    @Post('get_code')
    async getCode(@Body() userInput: { code: string, username: string}): Promise<any> {
        const personnal42Token = await this.authService.getUserToken(userInput.code);
        this.prismaService.user.update({ where: { username: userInput.username }, data: { personnal42Token: personnal42Token.access_token } });
        // Create a JWT Token
        // Get avatar from 42 API
        const request = await axios.get("https://api.intra.42.fr/v2/me", { headers: { Authorization: `Bearer ${personnal42Token.access_token}` } });
        const avatar = request.data.image.versions.small;
        this.prismaService.user.update({ where: { username: userInput.username }, data: { avatar: avatar } });
        console.log("avatar = ", avatar);
        return {
            success: true,
        }
    }
}
