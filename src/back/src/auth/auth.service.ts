import { Injectable } from '@nestjs/common';

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
        console.log(this.tokenApp, this.countdown);

        setTimeout(() => this.refresh(), this.countdown * 1000);
    }

    async refresh() {
        const answer = await this.getToken();
        this.tokenApp = answer.access_token;
        this.countdown = answer.expires_in;
        console.log(this.tokenApp, this.countdown);
    }

    async getToken(): Promise<any> {
        const request = fetch("https://api.intra.42.fr/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                grant_type: 'client_credentials',
                client_id: process.env.FORTY_TWO_UID,
                client_secret: process.env.FORTY_TWO_SECRET
            })
        });

        const response = await request;
        const data = await response.json();
        return (data)
    }

    async getUserToken(userCode: string): Promise<any> {
        const requestBody = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.FORTY_TWO_UID,
            client_secret: process.env.FORTY_TWO_SECRET,
            code: userCode,
            redirect_uri: "http://localhost:3133"
        });
    
        const request = fetch("https://api.intra.42.fr/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: requestBody
        });
    
        const response = await request;
        const data = await response.json();
        const token = data.access_token;
        const tokenExpires = data.expires_in;

        console.log(token, tokenExpires);
        return (response)
    }

    print(): void {
        console.log("token: ", this.tokenApp);
        console.log("countdown: ", this.countdown);
    }

    redirectUrl(): string {
        const queryParams = new URLSearchParams({
            client_id: process.env.FORTY_TWO_UID,
            redirect_uri: "http://localhost:3133",
        });

        return (`https://api.intra.42.fr/oauth/authorize?response_type=code&` + queryParams.toString())
    }
}