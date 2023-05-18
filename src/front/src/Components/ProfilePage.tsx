import React, { Component } from 'react';
import './css/ProfilePage.css';
import axios from 'axios';


interface IProps {}

interface IState {
    username: string;
    avatar: string,
    wins: number;
    losses: number;
    ladderLevel: number;
    achievements: {};
}

class ProfilePage extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            username: "",
            avatar: "",
            wins: 0,
            losses: 0,
            ladderLevel: 0,
            achievements: {}
        };
    }

    getUserInfo = async() => {
        const response = await axios.post("http://localhost:3333/profile/user_info", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), {headers: { 'Content-Type': 'application/json'}});
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.userInfo;
    }

    getAvatar = async() => {
        const response = await axios.post("http://localhost:3333/profile/avatar", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), {headers: { 'Content-Type': 'application/json'}});
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.avatar;
    }

    getUsername = async() => {
        const response = await axios.post("http://localhost:3333/profile/username", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), {headers: { 'Content-Type': 'application/json'}});
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.username;
    }

    getWins = async() => {
        const response = await axios.post("http://localhost:3333/profile/wins", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), {headers: { 'Content-Type': 'application/json'}});
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.wins;
    }

    getLosses = async() => {
        const response = await axios.post("http://localhost:3333/profile/losses", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), {headers: { 'Content-Type': 'application/json'}});
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.losses;
    }

    getLadderLevel = async() => {
        const response = await axios.post("http://localhost:3333/profile/ladder_level", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), {headers: { 'Content-Type': 'application/json'}});
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.ladderLevel;
    }

    getAchievements = async() => {
        const response = await axios.post("http://localhost:3333/profile/achievements", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), {headers: { 'Content-Type': 'application/json'}});
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.achievements;
    }

    async componentDidMount(): Promise<void> {
        this.getUserInfo()
            .then(userInfo => {
                this.setState({
                    username: userInfo.username,
                    avatar: userInfo.avatar,
                    wins: userInfo.wins,
                    losses: userInfo.losses,
                    ladderLevel: userInfo.ladderLevel,
                    achievements: userInfo.achievements
                });
            })
            .catch(error => {
                console.error("Error fetching user info:", error);
            });
    }
    

    render() {
        let ratio = this.state.wins * 100 / (this.state.wins + this.state.losses);
        if (this.state.wins === 0
            || this.state.losses === 0) 
            ratio = 0;
        return (
            <div>
                <p className="userName">{this.state.username}</p>
                <div className="pictureProfile" id="pfpPlaceholder" style={{backgroundImage: `url(${this.state.avatar})`}}/>
                <div className="stats">
                    <div className="winLose">
                        <p>Wins/Losses: {this.state.wins}/{this.state.losses} &ensp;{ratio.toFixed(2)}%</p>
                    </div>
                    <div className="ladderLevel">
                        <p>Level: {this.state.ladderLevel}</p>
                    </div>
                    <div className="achievements">
                        <p>Achievements: </p>
                    </div>
                </div>
                <p className="debug">DEBUG: wins:{this.state.wins} losses{this.state.losses} ladderLevel:{this.state.ladderLevel} avatar:{this.state.avatar}</p>
            </div>
        );
    }     
}

export default ProfilePage;