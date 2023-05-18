import React, { Component } from "react";
import axios from "axios";
import "./css/SocialPage.css";

interface IProps {}

interface IState {}

export default class SocialPage extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    async componentDidMount(): Promise<void> {
        const request = await axios.post('http://localhost:3333/auth/refresh_token', JSON.stringify({ refreshToken: sessionStorage.getItem('refreshToken'), login: sessionStorage.getItem('login') }), {headers: { 'Content-Type': 'application/json'}});
        if (request.data.success == true) {
            sessionStorage.setItem("accessToken", request.data.accessToken);
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
        }
        else
            console.error(request.data.error);
        setInterval(async () => {
            const request = await axios.post('http://localhost:3333/auth/refresh_token', JSON.stringify({ refreshToken: sessionStorage.getItem('refreshToken'), login: sessionStorage.getItem('login') }), {headers: { 'Content-Type': 'application/json'}});
                if (request.data.success == true) {
                    sessionStorage.setItem("accessToken", request.data.accessToken);
                    sessionStorage.setItem("refreshToken", request.data.refreshToken);
                }
                else
                    console.error(request.data.error);
            }
        , 60000)
    }

    render(): JSX.Element {
        return (
            <div>
                <h1 className="title">social page</h1>
                <div className="friend-list"></div>
                <div className="chat"></div>
            </div>
        );
    }
}