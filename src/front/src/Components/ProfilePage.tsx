import React, { Component } from 'react';
import './css/ProfilePage.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { isButtonElement } from 'react-router-dom/dist/dom';

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

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
    is2FAEnabled: boolean;
    qrCode: string;
    xp: number;
    isFriend: boolean;
    error: string;
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
            is2FAEnabled: false,
            qrCode: "",
            xp: 0,
            isFriend: false,
            error: "",
        };
        this.fileInputRef = React.createRef();
    }

    getUserInfoId = async () => {
        const request = await axios.post(
            'http://' + domain + `:3333/profile/${this.state.profileId}/`,
            JSON.stringify({
                username: sessionStorage.getItem('username'),
                refreshToken: sessionStorage.getItem("refreshToken"),
                accessToken: sessionStorage.getItem("accessToken"),
                id: this.state.profileId
            }),
            { headers: { "Content-Type": "application/json" } }
        )
        sessionStorage.setItem("refreshToken", request.data.refreshToken);
        sessionStorage.setItem("accessToken", request.data.accessToken);
        if (request.data.success === false)
            window.location.href = '/profile/';
        return request.data.userInfo;
    }

    getUserInfo = async () => {
        const response = await axios.post('http://' + domain + ':3333/profile/user_info/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.userInfo;
    }

    getAvatar = async () => {
        const response = await axios.post('http://' + domain + ':3333/profile/avatar/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.avatar;
    }

    getUsername = async () => {
        const response = await axios.post('http://' + domain + ':3333/profile/username/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.username;
    }

    getWins = async () => {
        const response = await axios.post('http://' + domain + ':3333/profile/wins/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.wins;
    }

    getLosses = async () => {
        const response = await axios.post('http://' + domain + ':3333/profile/losses/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.losses;
    }

    getLadderLevel = async () => {
        const response = await axios.post('http://' + domain + ':3333/profile/ladder_level/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.ladderLevel;
    }

    getAchievements = async () => {
        const response = await axios.post('http://' + domain + ':3333/profile/achievements/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.achievements;
    }

    get2FAStatus = async () => {
        const response = await axios.post('http://' + domain + ':3333/2fa/check_2fa/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        if (response.data.success === true) {
            sessionStorage.setItem("accessToken", response.data.accessToken);
            sessionStorage.setItem("refreshToken", response.data.refreshToken);
            this.setState({ qrCode: response.data.qrCode });
            return true;
        }
        return false;
    }

    async componentDidMount(): Promise<void> {
        this.setState({ is2FAEnabled: await this.get2FAStatus() });
        if (this.props.profileId === undefined) {
            this.getUserInfo()
                .then(userInfo => {
                    this.setState({
                        username: userInfo.username,
                        avatar: userInfo.avatar,
                        wins: userInfo.wins,
                        losses: userInfo.losses,
                        ladderLevel: userInfo.ladderLevel,
                        xp: userInfo.xp,
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
            this.setState({ isFriend: await this.getIsFriend() })
        }
    }

    async getIsFriend() {
        const request = await axios.post('http://' + domain + ':3333/profile/is_friend/',
            JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken"), profileId: this.state.profileId }), { headers: { 'Content-Type': 'application/json' } }
        )
        if (request.data.success === true) {
            if (request.data.isFriend === true) {
                sessionStorage.setItem("refreshToken", request.data.refreshToken);
                sessionStorage.setItem("accessToken", request.data.accessToken);
                return true;
            }
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
        }
        return false;
    }

    async checkUserExists() {
        const request = await axios.post('http://' + domain + ':3333/profile/user_check/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken"), id: this.state.profileId }), { headers: { 'Content-Type': 'application/json' } });
        if (request.data.success === false)
            window.location.href = '/profile/';
        sessionStorage.setItem("refreshToken", request.data.refreshToken);
        sessionStorage.setItem("accessToken", request.data.accessToken);
    }

    async fileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const avatar = new FormData();
            avatar.append('avatar', file);
            avatar.append('username', sessionStorage.getItem('username'));
            avatar.append('refreshToken', sessionStorage.getItem('refreshToken'));
            avatar.append('accessToken', sessionStorage.getItem('accessToken'));

            const request = await axios.post(
                'http://' + domain + ':3333/profile/upload/',
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
        window.location.href = '/profile/';
    };

    async disable2FA() {
        const request = await axios.post('http://' + domain + ':3333/2fa/disable_2fa/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        if (request.data.success === true) {
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
            window.location.href = '/profile/';
        }
    }

    async enable2FA() {
        const request = await axios.post('http://' + domain + ':3333/2fa/create/', JSON.stringify({ username: sessionStorage.getItem('username'), refreshToken: sessionStorage.getItem("refreshToken"), accessToken: sessionStorage.getItem("accessToken") }), { headers: { 'Content-Type': 'application/json' } });
        if (request.data.success === true) {
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
            window.location.href = '/profile/';
        }
    }

    async addFriend(): Promise<void> {
        const request = await axios.post(
            'http://' + domain + ':3333/social/send_friend_request/',
            JSON.stringify({
                requesterUsername: sessionStorage.getItem("username"),
                requestedUsername: this.state.username,
                refreshToken: sessionStorage.getItem("refreshToken"),
                accessToken: sessionStorage.getItem("accessToken"),
            }),
            { headers: { "Content-Type": "application/json" } }
        );
        if (request.data.success === true) {
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
        }
        else {
            if (request.data.error === "User already in friend list.") {
                sessionStorage.setItem("refreshToken", request.data.refreshToken);
                sessionStorage.setItem("accessToken", request.data.accessToken);
                console.error(request.data.error)
            }
            console.log("failed to send")
            console.error(request.data.error)
        }
    }

    async changeUsername() {
        const newUsername = prompt("Enter new username: ");
        if (newUsername !== null) {
            const request = await axios.post("http://" + domain + ":3333/profile/change_username/", JSON.stringify({
                username: sessionStorage.getItem('username'),
                accessToken: sessionStorage.getItem("accessToken"),
                refreshToken: sessionStorage.getItem("refreshToken"),
                newUsername: newUsername,
            }), { headers: { "Content-Type": "application/json" } });
            if (request.data.success) {
                sessionStorage.setItem("refreshToken", request.data.refreshToken);
                sessionStorage.setItem("accessToken", request.data.accessToken);
                sessionStorage.setItem("username", newUsername);
                window.location.href = "/profile";
            }
            else {
                console.error(request.data.error);
                alert(request.data.error);
            }
        }
    }

    render() {
        if (this.props.profileId != undefined && sessionStorage.getItem('username') == this.state.username)
            window.location.href = "/profile"
        let ratio = this.state.wins * 100 / (this.state.wins + this.state.losses);
        // if (this.state.wins === 0
        //     || this.state.losses === 0)
        //     ratio = 0;
        return (
            <div>
                {this.props.profileId === undefined && (
                    <div className="TwoFa">
                        {this.state.is2FAEnabled ? (
                            <p className="TwoFATrue">2FA is enabled</p>
                        ) : (
                            <p className="TwoFAFalse">2FA is disabled</p>
                        )}
                        {this.state.is2FAEnabled ? (
                            <button className="TwoFaButton" onClick={() => this.disable2FA()}>
                                Disable
                            </button>
                        ) : (
                            <button className="TwoFaButton" onClick={() => this.enable2FA()}>
                                Enable
                            </button>
                        )}
                    </div>
                )}
                {this.props.profileId === undefined && this.state.qrCode !== "" ?
                    <div className="qrCode" style={{ backgroundImage: `url(${this.state.qrCode})` }}></div> :
                    <div className="empty"></div>
                }
                <p className="userName">{this.state.username}</p>
                <div className="pictureProfile" id="pfpPlaceholder" style={{ backgroundImage: `url(${this.state.avatar})` }}>
                    {this.props.profileId === undefined &&
                        <>
                            <button className="downloadButton" onClick={() => this.fileInputRef.current!.click()}>
                                <input accept="image/*" type="file" className="visuallyHidden" ref={this.fileInputRef} onChange={event => this.fileChange(event)}></input>
                            </button>
                            <button className='change-username' onClick={this.changeUsername}>Change username</button>
                            {this.state.error != "" ? (<p className='error-profile-page'>{this.state.error}</p>) : null}
                        </>
                    }
                </div>
                {this.props.profileId !== undefined ?
                    (this.state.isFriend === false ? (
                        <button onClick={() => this.addFriend()} className='add-friend-profile'>
                            Add Friend
                        </button>
                    ) : null)
                    : null
                }

                <div className="stats">
                    <div className="winLose">
                        <p>Wins/Losses: {this.state.wins}/{this.state.losses} &ensp;{ratio.toFixed(2)}%</p>
                    </div>
                    <div className="ladderLevel">
                        <p>Level: {this.state.ladderLevel}</p>
                    </div>
                    <div className="achievements">
                        <p>Xp: {this.state.xp}/{this.state.ladderLevel * 100}</p>
                    </div>
                </div>
                <button className='match-history-button' onClick={() => { window.location.href = "/history" }}>Match History</button>
            </div>
        );
    }
}
export default withParams(ProfilePage);
