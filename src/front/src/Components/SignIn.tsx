import React, { Component } from 'react';
import './css/SignIn.css';
import axios from 'axios';
var bcrypt = require('bcryptjs');

interface IProps {
}

interface IState {
}

export default class SignIn extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {}
    }

    async redirectSignIn(): Promise<void> {
        const username = document.querySelector('.signin-username-input') as HTMLInputElement;
        const password = document.querySelector('.signin-password-input') as HTMLInputElement;
        if (username.value == '' || password.value == '')
            return;
        const request = await axios.post('http://localhost:3333/auth/verify_sign_in', JSON.stringify({ username: username.value, password: password.value }), { headers: { 'Content-Type': 'application/json' } });
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

    render() {
        return (
         <div className='signin-div'>
            <input type="text" placeholder='username' className='signin-username-input'/>
            <input type="password" placeholder='password' className='signin-password-input'/>
            <button className='signin-signin-button' onClick={this.redirectSignIn}>Sign In</button>
         </div>
        )
    }
}