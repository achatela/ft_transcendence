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

    getAvatar = async() => {
        const response = await axios.post("http://localhost:3333/profile/avatar", JSON.stringify({ username: sessionStorage.getItem('username'), jwt: sessionStorage.getItem('jwtToken') }), {headers: { 'Content-Type': 'application/json'}});
        return response.data.avatarUrl;
    }

    getUsername = async() => {
        const response = await axios.post("http://localhost:3333/profile/username", JSON.stringify({ username: sessionStorage.getItem('username'), jwt: sessionStorage.getItem('jwtToken') }), {headers: { 'Content-Type': 'application/json'}});
        return response.data.username;
    }

    getWins = async() => {
        const response = await axios.post("http://localhost:3333/profile/wins", JSON.stringify({ username: sessionStorage.getItem('username'), jwt: sessionStorage.getItem('jwtToken') }), {headers: { 'Content-Type': 'application/json'}});
        return response.data.wins;
    }

    getLosses = async() => {
        const response = await axios.post("http://localhost:3333/profile/losses", JSON.stringify({ username: sessionStorage.getItem('username'), jwt: sessionStorage.getItem('jwtToken') }), {headers: { 'Content-Type': 'application/json'}});
        return response.data.losses;
    }

    getLadderLevel = async() => {
        const response = await axios.post("http://localhost:3333/profile/ladder_level", JSON.stringify({ username: sessionStorage.getItem('username'), jwt: sessionStorage.getItem('jwtToken') }), {headers: { 'Content-Type': 'application/json'}});
        return response.data.ladderLevel;
    }

    getAchievements = async() => {
        const response = await axios.post("http://localhost:3333/profile/achievements", JSON.stringify({ username: sessionStorage.getItem('username'), jwt: sessionStorage.getItem('jwtToken') }), {headers: { 'Content-Type': 'application/json'}});
        return response.data.achievements;
    }

    componentDidMount(): void {
        this.getUsername()
            .then(username => {
                this.setState({ username });
            })
            .catch(error => {
                console.error("Error fetching username:", error);
            });
        this.getAvatar()
            .then(avatar => {
                this.setState({ avatar });
            })
            .catch(error => {
                console.error("Error fetching avatar:", error);
            });
        this.getWins()
            .then(wins => {
                this.setState({ wins });
            })
            .catch(error => {
                console.error("Error fetching wins:", error);
            });
        this.getLosses()
            .then(losses => {
                this.setState({ losses });
            })
            .catch(error => {
                console.error("Error fetching losses:", error);
            });
        this.getLadderLevel()
            .then(ladderLevel => {
                this.setState({ ladderLevel });
            })
            .catch(error => {
                console.error("Error fetching ladder level:", error);
            });
        // this.getAchievements()
    }
    

    render() {
        let ratio = this.state.wins * 100 / (this.state.wins + this.state.losses);
        return (
            <div>
                <p className="userName">{this.state.username}</p>
                <div className="pictureProfile" id="pfpPlaceholder" style={{backgroundImage: `url(${this.state.avatar})`}}/>
                <div className="stats">
                    <div className="winLose">
                        <p>Wins/Losses: {this.state.wins}/{this.state.losses} {ratio.toFixed(2)}</p>
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