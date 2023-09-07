import React, { Component } from 'react';
import './css/SignIn.css';
import BouncingBallsUI from './BouncingBallsUI';
import axios from 'axios';
var bcrypt = require('bcryptjs');

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

interface IProps {
}

interface IState {
    speed: number;
    balls: { x: number, y: number }[];
}

export default class SignIn extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            speed: 1,
            balls: [{ x: 900, y: 100 }],
        }
        this.addBall = this.addBall.bind(this);
        this.removeBall = this.removeBall.bind(this);
    }

    async redirectSignIn(): Promise<void> {
        const username = document.querySelector('.signin-username-input') as HTMLInputElement;
        const password = document.querySelector('.signin-password-input') as HTMLInputElement;
        if (username.value == '' || password.value == '')
            return;
        const request = await axios.post('http://' + domain + ':3333/auth/verify_sign_in', JSON.stringify({ username: username.value, password: password.value }), { headers: { 'Content-Type': 'application/json' } });
        if (request.data.success) {
            sessionStorage.setItem("username", request.data.username);
            sessionStorage.setItem("accessToken", request.data.accessToken);
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            if (request.data.twoFa === false)
                window.location.href = '/profile';
            else
                window.location.href = '/two_fa';
        }
        else {
            alert(request.data.error)
        }
        return;
    }

    addBall() {
        this.setState((prevState) => ({
            balls: [
                ...prevState.balls,
                { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
            ],
        }));
    }

    removeBall() {
        this.setState((prevState) => {
            if (prevState.balls.length > 0) {
                return { balls: prevState.balls.slice(0, -1) };
            } else {
                return { balls: prevState.balls };
            }
        });
    }

    render() {
        return (
            <>
                <button className="go-back-button" onClick={() => { window.location.href = "/" }}>Go back</button>
                <div className='signin-div'>
                    <input type="text" placeholder='username' className='signin-username-input' />
                    <input type="password" placeholder='password' className='signin-password-input' />
                    <button className='signin-signin-button' onClick={this.redirectSignIn}>Sign In</button>
                </div>
            </>
        )
    }
}