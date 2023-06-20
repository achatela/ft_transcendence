import { Component } from 'react';
import './css/ModePage.css'
import axios from 'axios';

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

    getCurrentPlayer = async () => {
        // const response = await fetch('http://localhost:3333/player_number');
        // const data = await response.json();
        // return data.currentPlayers;
    };

    async componentDidMount(): Promise<void> {
        if (sessionStorage.getItem("queueing") === "Classic Pong") {
            this.interval = setInterval(async () => {
                const response = await axios.post('http://localhost:3333/pong/classic/queue_status/',
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
                        window.location.href = "/game";
                    }
                }
                else {
                    sessionStorage.setItem("queueing", "");
                    window.location.href = "/mode";
                }
            }, 1000);
        }
        else if (sessionStorage.getItem("queueing") === "Custom Pong") {
            this.interval = setInterval(async () => {
                const response = await axios.post('http://localhost:3333/pong/custom/queue_status/',
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
                        window.location.href = "/game";
                    }
                }
                else {
                    sessionStorage.setItem("queueing", "");
                    window.location.href = "/mode";
                }
            }, 1000);
        }
        // this.getCurrentPlayer()
        // .then(currentPlayers => {
        //     this.setState({ currentPlayers });
        // })
        // .catch(error => {
        //     console.error("Error fetching current players:", error);
        // });
    }

    queueClassic = async () => {
        const response = await axios.post('http://localhost:3333/pong/classic/queue_up/',
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
            window.location.href = "/mode";
        }
        else {
            console.log("pas coucou")
        }
    };

    queueCustom = async () => {
        const response = await axios.post('http://localhost:3333/pong/custom/queue_up/',
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
            window.location.href = "/mode";
        }
        else {
            console.log("pas coucou")
        }
    };

    cancelQueue = async () => {
        if (sessionStorage.getItem("queueing") === "Classic Pong") {
            const response = await axios.post('http://localhost:3333/pong/classic/queue_down/',
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
        else if (sessionStorage.getItem("queueing") === "Custom Pong") {
            const response = await axios.post('http://localhost:3333/pong/custom/queue_down/',
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
    }

    componentWillUnmount(): void {
        clearInterval(this.interval);
    }

    render() {
        return (
            <div className="divModePage">
                <button className='reset-debug' onClick={() => { sessionStorage.setItem("queueing", ""); window.location.href = "/mode" }}></button>
                {!sessionStorage.getItem("queueing") && (
                    <div className="normalGameMode">
                        <p className="classicPong" onClick={this.queueClassic}>Classic Pong</p>
                        <div className="imgPlaceHolder"></div>
                    </div>
                )}
                {!sessionStorage.getItem("queueing") && (
                    <div className="customGameMode">
                        <p className="customPong" onClick={this.queueCustom}>Custom Pong</p>
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