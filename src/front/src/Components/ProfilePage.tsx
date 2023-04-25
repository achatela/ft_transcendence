import React, { Component } from 'react';
import './css/ProfilePage.css'

interface IProps {}

interface IState {
    username: string;
    avatar: {};
}

class ProfilePage extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            username: "",
            avatar: {}
        };
    }

    getUsername = async() => {
        const response = await fetch('http://localhost:3333/profile/username');
        const data = await response.json();
        return data.username;
    }

    componentDidMount(): void {
        this.getUsername()
            .then(username => {
                this.setState({ username });
            })
            .catch(error => {
                console.error("Error fetching username:", error);
            });
    }

    render() {
        return (
            <div>
                <p className="userName">{this.state.username}</p>
                <div className="pictureProfile" id="pfpPlaceholder"/>
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
            </div>
        );
    }     
}

export default ProfilePage;