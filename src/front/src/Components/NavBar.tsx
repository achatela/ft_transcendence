import React, { Component } from 'react';
import './css/NavBar.css';
import axios from 'axios';

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

interface IProps {
}

interface IState {
    isSpread: boolean,
}

export default class NavBar extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isSpread: false,
        }
    }

    async handleLogout() {
        const request = await axios.post('http://' + domain + ':3333/auth/log_out/', JSON.stringify({
            username: sessionStorage.getItem('username'),
            accessToken: sessionStorage.getItem("accessToken"),
            refreshToken: sessionStorage.getItem("refreshToken"),
        }), { headers: { "Content-Type": "application/json" } });
        if (sessionStorage.getItem("queueing") === "Classic Pong") {
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
            }
            else
                sessionStorage.setItem("queueing", "");
        }
        else if (sessionStorage.getItem("queueing") === "Custom Pong") {
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
            }
            else
                sessionStorage.setItem("queueing", "");
        }
        sessionStorage.clear();
        window.location.href = "/";
    }

    render() {
        return (
            <div>
                <div className='menu-button' onClick={() => { this.setState({ isSpread: true }) }}></div>
                {this.state.isSpread == true ? (
                    <div className='menu'>
                        <button className='close-menu' onClick={() => { this.setState({ isSpread: false }) }} >X</button>
                        <div onClick={() => { window.location.href = "/social" }} className='menu-social'>Friends/Channels</div>
                        <div onClick={() => { window.location.href = "/mode" }} className='menu-play'>Play Game</div>
                        <div onClick={() => { window.location.href = "/profile" }} className='menu-profile'>Profile</div>
                        <div onClick={() => { this.handleLogout() }}>Logout</div>
                    </div>
                )
                    : null
                }
            </div>
        )
    }
}
