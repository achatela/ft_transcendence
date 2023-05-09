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

        setTimeout(() => this.init(), this.countdown * 1000);
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

    redirectUrl(): string {
        const queryParams = new URLSearchParams({
            client_id: process.env.FORTY_TWO_UID,
            redirect_uri: "http://localhost:3133",
        });

        return (`https://api.intra.42.fr/oauth/authorize?response_type=code&` + queryParams.toString())
    }

    // async connectUser(): Promise<any> {
    //     const queryParams = new URLSearchParams({
    //         client_id: process.env.FORTY_TWO_UID,
    //         redirect_uri: "http://localhost:3133",
    //     });

    //     console.log(`https://api.intra.42.fr/oauth/authorize?response_type=code` + queryParams.toString())
        
    //     const request = fetch(`https://api.intra.42.fr/oauth/authorize?\${queryParams.toString()}`, {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "code"
    //         },
    //     })

    //     const response = await request;
    //     console.log(response);
    //     return (request)
    // }
}

