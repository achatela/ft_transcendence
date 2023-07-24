import React, { Component } from 'react';
import './css/SignUp.css';
import axios from 'axios';
var bcrypt = require('bcryptjs');

interface IProps {
}

interface IState {
}

export default class SignUp extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {}
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

    render() {
        return (
         <div className='signup-div'>
            <input type="text" placeholder='username' className='username-input'/>
            <input type="password" placeholder='password' className='password-input'/>
            <button className='signup-signup-button' onClick={this.redirectSignUp}>Sign Up</button>
         </div>
        )
    }
}