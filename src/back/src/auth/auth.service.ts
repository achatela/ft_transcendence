import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
    tokenApp: string;
    countdown: number;
    
    constructor() {
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


    async getUserToken(userCode: string): Promise<{success: boolean, access_token?: string, expires_in?: string}> {
        const requestBody = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.FORTY_TWO_UID,
            client_secret: process.env.FORTY_TWO_SECRET,
            code: userCode,
            redirect_uri: "http://localhost:3133"
        });
    
        try{
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
        catch{
            console.error("in getUserToken catch");
            return {success: false};
        }
    }

    print(): void {
        console.log("token: ", this.tokenApp);
        console.log("countdown: ", this.countdown);
    }

    redirectUrl(username: string): string {
        const queryParams = new URLSearchParams({
            client_id: process.env.FORTY_TWO_UID,
            redirect_uri: "http://localhost:3133",
        });

        return (`https://api.intra.42.fr/oauth/authorize?response_type=code&` + queryParams.toString())
    }
}