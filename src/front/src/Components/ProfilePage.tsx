import React, { Component } from 'react';
import './css/ProfilePage.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function withParams(WrappedComponent: React.ComponentType<any>) {
    return (props: any) => {
        const { profileId } = useParams<{ profileId: string }>();
        return <WrappedComponent profileId={profileId} {...props} />;
    };
}


interface IProps {
    profileId: string;
}

interface IState {
    username: string;
    avatar: string,
    wins: number;
    losses: number;
    ladderLevel: number;
    achievements: {};
    profileId: number;
}

class ProfilePage extends Component<IProps, IState> {
    fileInputRef: React.RefObject<HTMLInputElement>;
    constructor(props: IProps) {
        super(props);
        this.state = {
            username: "",
            avatar: "",
            wins: 0,
            losses: 0,
            ladderLevel: 0,
            achievements: {},
            profileId: parseInt(props.profileId),
        };
        this.fileInputRef = React.createRef();
    }

    getUserInfoId = async () => {
        const request = await axios.post(
            `http://localhost:3333/profile/${this.state.profileId}/`,
            JSON.stringify({
                login: sessionStorage.getItem('login'),
                refreshToken: sessionStorage.getItem("refreshToken"),
                accessToken: sessionStorage.getItem("accessToken"),
                id: this.state.profileId
            }),
            { headers: { "Content-Type": "application/json" } }
        )
        sessionStorage.setItem("refreshToken", request.data.refreshToken);
        sessionStorage.setItem("accessToken", request.data.accessToken);
        if (request.data.success === false)
            window.location.href = 'http://localhost:3133/profile/';
        return request.data.userInfo;
    }

    getUserInfo = async () => {
        const response = await axios.post("http://localhost:3333/profile/user_info/", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.userInfo;
    }

    getAvatar = async () => {
        const response = await axios.post("http://localhost:3333/profile/avatar/", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.avatar;
    }

    getUsername = async () => {
        const response = await axios.post("http://localhost:3333/profile/username/", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.username;
    }

    getWins = async () => {
        const response = await axios.post("http://localhost:3333/profile/wins/", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.wins;
    }

    getLosses = async () => {
        const response = await axios.post("http://localhost:3333/profile/losses/", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.losses;
    }

    getLadderLevel = async () => {
        const response = await axios.post("http://localhost:3333/profile/ladder_level/", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.ladderLevel;
    }

    getAchievements = async () => {
        const response = await axios.post("http://localhost:3333/profile/achievements/", JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.achievements;
    }

    async componentDidMount(): Promise<void> {
        if (this.props.profileId === undefined) {
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
        else {
            this.checkUserExists()
            this.getUserInfoId()
                .then(userInfo => {
                    this.setState({
                        username: userInfo.username,
                        avatar: userInfo.avatar,
                        wins: userInfo.wins,
                        losses: userInfo.losses,
                        ladderLevel: userInfo.level,
                        achievements: userInfo.achievements
                    });
                })
                .catch(error => {
                    console.error("Error fetching user info:", error);
                }
                );
        }
    }

    async checkUserExists() {
        const request = await axios.post('http://localhost:3333/profile/user_check/', JSON.stringify({ login: sessionStorage.getItem('login'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken"), id: this.state.profileId }), { headers: { 'Content-Type': 'application/json' } });
        if (request.data.success === false)
            window.location.href = 'http://localhost:3133/profile/';
        sessionStorage.setItem("refreshToken", request.data.refreshToken);
        sessionStorage.setItem("accessToken", request.data.accessToken);
    }

    async fileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const avatar = new FormData();
            avatar.append('avatar', file);
            avatar.append('login', sessionStorage.getItem('login'));
            avatar.append('refreshToken', sessionStorage.getItem('refreshToken'));
            avatar.append('accessToken', sessionStorage.getItem('accessToken'));

            const request = await axios.post(
                'http://localhost:3333/profile/upload/',
                avatar,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
        }
        window.location.href = 'http://localhost:3133/profile/';
    };

    render() {
        let ratio = this.state.wins * 100 / (this.state.wins + this.state.losses);
        if (this.state.wins === 0
            || this.state.losses === 0)
            ratio = 0;
        return (
            <div>
                <p className="userName">{this.state.username}</p>
                <div className="pictureProfile" id="pfpPlaceholder" style={{ backgroundImage: `url(${this.state.avatar})` }}>
                    {this.props.profileId === undefined &&
                        <button className="downloadButton" onClick={() => this.fileInputRef.current!.click()}>
                            <input accept="image/*" type="file" className="visuallyHidden" ref={this.fileInputRef} onChange={event => this.fileChange(event)}></input>
                        </button>
                    }
                </div>
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
            </div>
        );
    }
}

export default withParams(ProfilePage);