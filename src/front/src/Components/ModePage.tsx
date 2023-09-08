import { Component } from 'react';
import './css/ModePage.css'
import axios from 'axios';

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

interface IProps { }

interface IState {
    currentPlayers: number;
}

class ModePage extends Component<IProps, IState> {
    interval: NodeJS.Timer;
    constructor(props: IProps) {
        super(props);
        this.state = {
            currentPlayers: 0
        };
    }

    async componentDidMount(): Promise<void> {
        if (sessionStorage.getItem("username") === null) {
            window.location.href = "/";
        }
        if (sessionStorage.getItem("queueing") === "Classic Pong") {
            this.interval = setInterval(async () => {
                try {
                    const response = await axios.post('http://' + domain + ':3333/pong/classic/queue_status/',
                        JSON.stringify({
                            username: sessionStorage.getItem('username'),
                            refreshToken: sessionStorage.getItem('refreshToken'),
                            accessToken: sessionStorage.getItem('accessToken'),
                        }),
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    if (response.data.success === true) {
                        sessionStorage.setItem('accessToken', response.data.accessToken);
                        sessionStorage.setItem('refreshToken', response.data.refreshToken);
                        if (response.data.queueStatus === "found") {
                            sessionStorage.setItem("queueing", "");
                            sessionStorage.setItem("gameMode", "classic")
                            window.location.href = "/game";
                        }
                    }
                    else {
                        sessionStorage.setItem("queueing", "");
                        window.location.href = "/mode";
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }, 1000);
        }
        else if (sessionStorage.getItem("queueing") === "Custom Pong") {
            this.interval = setInterval(async () => {
                try {

                    const response = await axios.post('http://' + domain + ':3333/pong/custom/queue_status/',
                        JSON.stringify({
                            username: sessionStorage.getItem('username'),
                            refreshToken: sessionStorage.getItem('refreshToken'),
                            accessToken: sessionStorage.getItem('accessToken'),
                        }),
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    if (response.data.success === true) {
                        sessionStorage.setItem('accessToken', response.data.accessToken);
                        sessionStorage.setItem('refreshToken', response.data.refreshToken);
                        if (response.data.queueStatus === "found") {
                            sessionStorage.setItem("queueing", "");
                            sessionStorage.setItem("gameMode", "custom")
                            window.location.href = "/game";
                        }
                    }
                    else {
                        sessionStorage.setItem("queueing", "");
                        window.location.href = "/mode";
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }, 1000);
        }
    }

    componentCleanup() {
        clearInterval(this.interval);
    }

    async queueClassic() {
        try {
            const response = await axios.post('http://' + domain + ':3333/pong/classic/queue_up/',
                JSON.stringify({
                    username: sessionStorage.getItem('username'),
                    refreshToken: sessionStorage.getItem('refreshToken'),
                    accessToken: sessionStorage.getItem('accessToken'),
                }),
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success === true) {
                sessionStorage.setItem('accessToken', response.data.accessToken);
                sessionStorage.setItem('refreshToken', response.data.refreshToken);
                sessionStorage.setItem("queueing", "Classic Pong");
                sessionStorage.setItem("fix", "one")
                window.location.href = "/mode";
            }
            else {
                console.log("pas coucou")
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    async queueCustom() {
        try {
            const response = await axios.post('http://' + domain + ':3333/pong/custom/queue_up/',
                JSON.stringify({
                    username: sessionStorage.getItem('username'),
                    refreshToken: sessionStorage.getItem('refreshToken'),
                    accessToken: sessionStorage.getItem('accessToken'),
                }),
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success === true) {
                sessionStorage.setItem('accessToken', response.data.accessToken);
                sessionStorage.setItem('refreshToken', response.data.refreshToken);
                sessionStorage.setItem("queueing", "Custom Pong");
                sessionStorage.setItem("fix", "one")
                window.location.href = "/mode";
            }
            else {
                console.log("pas coucou")
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    async cancelQueue() {
        if (sessionStorage.getItem("queueing") === "Classic Pong") {
            try {
                const response = await axios.post('http://' + domain + ':3333/pong/classic/queue_down/',
                    JSON.stringify({
                        username: sessionStorage.getItem('username'),
                        refreshToken: sessionStorage.getItem('refreshToken'),
                        accessToken: sessionStorage.getItem('accessToken'),
                    }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success === true) {
                    sessionStorage.setItem('accessToken', response.data.accessToken);
                    sessionStorage.setItem('refreshToken', response.data.refreshToken);
                    sessionStorage.setItem("queueing", "");
                    window.location.href = "/mode";
                }
                else {
                    sessionStorage.setItem("queueing", "");
                    window.location.href = "/mode";
                }
            }
            catch (err) {
                console.log(err);
            }
        }
        else if (sessionStorage.getItem("queueing") === "Custom Pong") {
            try {
                const response = await axios.post('http://' + domain + ':3333/pong/custom/queue_down/',
                    JSON.stringify({
                        username: sessionStorage.getItem('username'),
                        refreshToken: sessionStorage.getItem('refreshToken'),
                        accessToken: sessionStorage.getItem('accessToken'),
                    }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success === true) {
                    sessionStorage.setItem('accessToken', response.data.accessToken);
                    sessionStorage.setItem('refreshToken', response.data.refreshToken);
                    sessionStorage.setItem("queueing", "");
                    window.location.href = "/mode";
                }
                else {
                    sessionStorage.setItem("queueing", "");
                    window.location.href = "/mode";
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    }

    render() {
        return (
            <div className="divModePage">
                {!sessionStorage.getItem("queueing") && (
                    <div className="normalGameMode" onClick={this.queueClassic}>
                        <p className="classicPong">Classic Pong</p>
                        <div className="imgPlaceHolder"></div>
                    </div>
                )}
                {!sessionStorage.getItem("queueing") && (
                    <div className="customGameMode" onClick={this.queueCustom}>
                        <p className="customPong">Custom Pong</p>
                        <div className="imgPlaceHolder2"></div>
                    </div>
                )}
                {sessionStorage.getItem("queueing") && (
                    <div className="queueing">
                        <p className="queueingP">Queueing for {sessionStorage.getItem("queueing")}<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span></p>
                        <button className="cancelButton" onClick={this.cancelQueue} >Cancel</button>
                    </div>
                )}
            </div>
        );
    }
}

export default ModePage;