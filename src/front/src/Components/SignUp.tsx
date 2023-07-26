import React, { Component } from 'react';
import './css/SignUp.css';
import BouncingBall from './BouncingBall';
import SpeedSlider from './SpeedSlider';
import axios from 'axios';
var bcrypt = require('bcryptjs');

interface IProps {
}

interface IState {
    speed: number;
    balls: { x: number, y: number }[];
}

export default class SignUp extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            speed: 1,
            balls: [{ x: 900, y: 100 }],
        }
        this.addBall = this.addBall.bind(this);
        this.removeBall = this.removeBall.bind(this);
    }

    async redirectSignUp(): Promise<void> {
        const username = document.querySelector('.username-input') as HTMLInputElement;
        const password = document.querySelector('.password-input') as HTMLInputElement;
        if (username.value == '' || password.value == '')
            return;
        const request = await axios.post('http://localhost:3333/auth/verify_sign_up', JSON.stringify({ username: username.value, password: bcrypt.hashSync(password.value, 10) }), { headers: { 'Content-Type': 'application/json' } });
        if (request.data.success) {
            sessionStorage.setItem("username", request.data.username);
            sessionStorage.setItem("accessToken", request.data.accessToken);
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            window.location.href = '/profile';
        }
        else {
            console.log(request.data.error);
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
                <SpeedSlider onSpeedChange={() => {this.setState({speed: this.state.speed})}} />
                <div className='signup-div'>
                <input type="text" placeholder='username' className='username-input'/>
                <input type="password" placeholder='password' className='password-input'/>
                <button className='signup-signup-button' onClick={this.redirectSignUp}>Sign Up</button>
                </div>
                {this.state.balls.map((ball, index) => (
                <BouncingBall key={index} speed={this.state.speed} queryType={2} />
                ))}
                <button className="addBallButton" type="button" onClick={this.addBall}>
                    Add Ball
                </button>
                <button className="removeBallButton" type="button" onClick={this.removeBall}>
                    Remove Ball
                </button>
            </>
        )
    }
}