import React, { Component } from "react";
import axios from "axios";
import "./css/SocialPage.css";
import FriendRequest from "./FriendRequest";

interface IProps {}

interface IState {
  friendRequests: string[] | null;
}

export default class SocialPage extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      friendRequests: null,
    };
  }

  async getFriendRequests(): Promise<string[]> {
    const response = await axios.post(
      "http://localhost:3333/social/friend_request",
      JSON.stringify({
        login: sessionStorage.getItem("login"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        accessToken: sessionStorage.getItem("accessToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === true) {
        sessionStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        return response.data.listRequest;
    }
    else {
        console.log("failed")
    }
  }

  async componentDidMount(): Promise<void> {
    const friendRequests = await this.getFriendRequests();
    this.setState({ friendRequests });
  }

  render(): JSX.Element {
    console.log(this.state.friendRequests);
    return (
      <div>
        <h1 className="title">social page</h1>
        <div className="friend-list"></div>
        {this.state.friendRequests ? (
          <div className="friend-request">
            {this.state.friendRequests.map((request) => (
              <FriendRequest key={request} name={request} />
            ))}
          </div>
        ) : (
          <div className="friend-request">Loading...</div>
        )}
        <div className="chat"></div>
      </div>
    );
  }
}
