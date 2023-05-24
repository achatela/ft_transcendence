import { Component, useState } from "react";
import axios from "axios";
import './css/TwoFa.css';

interface IProps {

}

interface IState {

}

class TwoFa extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {

        }
    }

    generateKey = async () => {
        const request = await axios.post('http://localhost:3333/2fa/create',
        JSON.stringify(
        {
            login: sessionStorage.getItem('login'),
            refreshToken: sessionStorage.getItem('refreshToken'),
            accessToken: sessionStorage.getItem('accessToken'),
        }

        ),
        {headers: { 'Content-Type': 'application/json'}});
        console.log(request.data);
    }

    sendInput = async () => {
        const request = await axios.post("http://localhost:3333/2fa/verify",
        JSON.stringify(
        {
            token: "252911",
            login: sessionStorage.getItem('login'),
            // refreshToken: sessionStorage.getItem('refreshToken'),
            // accessToken: sessionStorage.getItem('accessToken'),
        }),
        {headers: { 'Content-Type': 'application/json'}});
        console.log(request.data);
    }

    render() {
        return (
            <div>
                <button className="generate" onClick={this.generateKey}>generate key</button>
                <button className="send-input" onClick={this.sendInput}>send input</button>
            </div>
        )
    }
}

export default TwoFa;