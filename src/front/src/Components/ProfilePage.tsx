import React, { Component } from 'react';
import './css/ProfilePage.css';


interface IProps {}

interface IState {
    username: string;
    avatar: {
        avatarUrl: string;
    };
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
            avatar: {
                avatarUrl: ""
            },
            wins: 0,
            losses: 0,
            ladderLevel: 0,
            achievements: {}
        };
    }

    getAvatar = async() => {
        const response = await fetch("http://localhost:3333/profile/avatar");
        const data = await response.json();
        let ret = {
            avatarUrl: data.avatarUrl
        }   
        return ret;
    }

    getUsername = async() => {
        const response = await fetch('http://localhost:3333/profile/username');
        const data = await response.json();


        // tmp, should be moved to the moment we create the user
        // const create = await fetch("http://localhost:3333/prisma/create_user", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify({
        //             name: "hcarpent",
        //             hashedPassword: "hcarpent2009",
        //             email: "123@123.fr"
        //             })
        //         });
        // const createData = await create.json();
        // if (createData.success) {
        //     console.log("Created user");
        // }
        // else {
        //     console.log("Failed to create user");
        // }
        return data.username;
    }

    getWins = async() => {
        const response = await fetch('http://localhost:3333/profile/wins');
        const data = await response.json();
        return data.wins;
    }

    getLosses = async() => {
        const response = await fetch('http://localhost:3333/profile/losses');
        const data = await response.json();
        return data.losses;
    }

    getLadderLevel = async() => {
        const response = await fetch('http://localhost:3333/profile/ladder_level');
        const data = await response.json();
        return data.losses;
    }

    getAchievements = async() => {
        const response = await fetch('htpp://localhost:3333/profile/achievements');
        const data = await response.json();
        return data.achievements;
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
        console.log(this.state.avatar.avatarUrl)
        return (
            <div>
                <p className="userName">{this.state.username}</p>
                <div className="pictureProfile" id="pfpPlaceholder" style={{backgroundImage: `url(${this.state.avatar.avatarUrl})`}}/>
                <div className="stats">
                    <div className="winLose">
                        <p></p>
                    </div>
                    <div className="ladderLevel">
                        <p></p>
                    </div>
                    <div className="achievements">
                        <p></p>
                    </div>
                </div>
                <p className="debug">DEBUG: wins:{this.state.wins} losses{this.state.losses} ladderLevel:{this.state.ladderLevel} avatar:{this.state.avatar.avatarUrl}</p>
            </div>
        );
    }     
}

export default ProfilePage;