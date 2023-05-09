import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    token: string;
    countdown: number;
    
    constructor() {
        this.init();
    }

    async init() {
        const answer = await this.getToken();
        this.token = answer.access_token;
        this.countdown = answer.expires_in;
        console.log(this.token, this.countdown);

        setTimeout(() => this.refresh(), this.countdown * 1000);
    }

    async refresh() {
        const answer = await this.getToken();
        this.token = answer.access_token;
        this.countdown = answer.expires_in;
        console.log(this.token, this.countdown);
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
    
        request.then(response => {
            console.log(response);
            // Access all properties of the response object here
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers);
            console.log(response.url);
            console.log(response.body);
            console.log(response.bodyUsed);
            console.log(response.type);
            console.log(response.redirected);
            console.log(response.ok);
          });
          
        const response = await request;
        // const data = await response.json();
        // const token = data.access_token;

        // console.log(token)
        return (response)
    }
    

    print(): void {
        console.log("token: ", this.token);
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

