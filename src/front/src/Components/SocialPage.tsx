import React, { Component } from "react";
import axios from "axios";
import "./css/SocialPage.css";
import FriendRequest from "./FriendRequest";
import FriendList from "./FriendList";

interface IProps {}

interface IState {
  friendRequests: string[] | null;
  friendList: string[] | null;
}

export default class SocialPage extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      friendRequests: null,
      friendList: null,
    };
  }

  async getFriendRequests(): Promise<string[]> {
    const response = await axios.post(
      "http://localhost:3333/social/friend_request/",
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

  async getFriendList(): Promise<string[]> {
    const response = await axios.post(
      "http://localhost:3333/social/friend_list/",
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
        console.log("friends list", response.data.listFriend)
        return response.data.listFriend;
    }
    else {
        console.log("failed")
    }
  }

  async componentDidMount(): Promise<void> {
    const friendRequests = await this.getFriendRequests();
    this.setState({ friendRequests: friendRequests });
    const friendList = await this.getFriendList();
    this.setState({ friendList: friendList });
  }

  async acceptFunction(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    let name = event.currentTarget.dataset.name;
    const request = await axios.post(
        "http://localhost:3333/social/accept_friend_request/",
        JSON.stringify({
            // problème peut-être à cause de cette ligne, doit encore test avec beaucoup de demandes, et/ou avec accents
            usernameToAccept: name,
            loginUser: sessionStorage.getItem("login"),
            refreshToken: sessionStorage.getItem("refreshToken"),
            accessToken: sessionStorage.getItem("accessToken"),
        }),
        { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
        sessionStorage.setItem("refreshToken", request.data.refreshToken);
        sessionStorage.setItem("accessToken", request.data.accessToken);
        console.log("accepted")
    }
    else {
        console.log("failed to accept")
    }
  window.location.href = "http://localhost:3133/social/";
}      


async declineFunction(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
  const name = event.currentTarget.dataset.name;
  const request = await axios.post(
    "http://localhost:3333/social/decline_friend_request/",
    JSON.stringify({
      usernameToDecline: name,
      loginUser: sessionStorage.getItem("login"),
      refreshToken: sessionStorage.getItem("refreshToken"),
      accessToken: sessionStorage.getItem("accessToken"),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
  if (request.data.success === true) {
    sessionStorage.setItem("refreshToken", request.data.refreshToken);
    sessionStorage.setItem("accessToken", request.data.accessToken);
    console.log("declined")
  }
  else {
    console.log("failed to decline")
  }
  window.location.href = "http://localhost:3133/social/";
}

    async sendFriendRequest(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
      let inputElement = document.querySelector(".add-friend-input") as HTMLInputElement;
      const request = await axios.post(
        "http://localhost:3333/social/send_friend_request/",
        JSON.stringify({
          usernameToSend: inputElement.value,
          loginUser: sessionStorage.getItem("login"),
          refreshToken: sessionStorage.getItem("refreshToken"),
          accessToken: sessionStorage.getItem("accessToken"),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (request.data.success === true) {
        sessionStorage.setItem("refreshToken", request.data.refreshToken);
        sessionStorage.setItem("accessToken", request.data.accessToken);
        inputElement.value = "Friend request sent !";
      }
      else {
        if (request.data.error === "User already in friend list."){
          sessionStorage.setItem("refreshToken", request.data.refreshToken);
          sessionStorage.setItem("accessToken", request.data.accessToken);
          inputElement.value = request.data.error;
        }
        console.log("failed to send")
        inputElement.value = request.data.error;
      }
    }

    async removeFriend(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
      let name = event.currentTarget.dataset.name;
      const request = await axios.post(
        "http://localhost:3333/social/remove_friend",
        JSON.stringify({
          usernameToRemove: name,
          loginUser: sessionStorage.getItem("login"),
          refreshToken: sessionStorage.getItem("refreshToken"),
          accessToken: sessionStorage.getItem("accessToken"),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (request.data.success === true) {
        sessionStorage.setItem("refreshToken", request.data.refreshToken);
        sessionStorage.setItem("accessToken", request.data.accessToken);
        console.log("removed")
      }
      else {
        console.log("failed to remove")
      }
      window.location.href = "http://localhost:3133/social/";
      return;
  }  

  render(): JSX.Element {
    return (
      <div>
        {this.state.friendList ? (
          <div className="friend-list">
            {this.state.friendList.map((request) => (
              <FriendList key={request} name={request} removeFriend={this.removeFriend} />
            ))}
          </div>
        ) : (
          <div className="friend-list">Loading...</div>
        )}
        <div className="add-friend">
          <p className="add-friend-text">Add Friend</p>
          <input className="add-friend-input" type="text"/>
          <button className="add-friend-button" onClick={this.sendFriendRequest}>Send</button>
        </div>
        {this.state.friendRequests ? (
          <div className="friend-request">
            {this.state.friendRequests.map((request) => (
              <FriendRequest declineFunction={this.declineFunction} acceptFunction={this.acceptFunction} key={request} name={request} />
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
