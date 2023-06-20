import React, { Component } from "react";
import axios from "axios";
import "./css/SocialPage.css";
import FriendRequests from "./FriendRequests";
import Chat from "./Chat";


interface IProps { }

interface IState {
  friendRequests: string[] | null;
  friends: string[] | null;
  chat: { room: string, messages: string[] } | null;
}

export default class SocialPage extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.openFriendChat = this.openFriendChat.bind(this);
    this.state = {
      friendRequests: null,
      friends: null,
      chat: null
    };
  }

  async getFriendRequests(): Promise<string[]> {
    const response = await axios.post(
      "http://localhost:3333/social/friend_request/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        accessToken: sessionStorage.getItem("accessToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === true) {
      sessionStorage.setItem("refreshToken", response.data.refreshToken);
      sessionStorage.setItem("accessToken", response.data.accessToken);
      return response.data.friendRequests;
    }
    else {
      console.log("failed")
    }
  }

  async getFriends(): Promise<string[]> {
    const response = await axios.post(
      "http://localhost:3333/social/friends/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        accessToken: sessionStorage.getItem("accessToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === true) {
      sessionStorage.setItem("refreshToken", response.data.refreshToken);
      sessionStorage.setItem("accessToken", response.data.accessToken);
      console.log("friends", response.data.friends)
      return response.data.friends;
    }
    else {
      console.log("failed")
    }
  }

  async componentDidMount(): Promise<void> {
    const friendRequests = await this.getFriendRequests();
    this.setState({ friendRequests: friendRequests });
    const friends = await this.getFriends();
    this.setState({ friends: friends });
  }

  async sendFriendRequest(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    let inputElement = document.querySelector(".add-friend-input") as HTMLInputElement;
    const request = await axios.post(
      "http://localhost:3333/social/send_friend_request/",
      JSON.stringify({
        requesterUsername: sessionStorage.getItem("username"),
        requestedUsername: inputElement.value,
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
      if (request.data.error === "User already in friend list.") {
        sessionStorage.setItem("refreshToken", request.data.refreshToken);
        sessionStorage.setItem("accessToken", request.data.accessToken);
        inputElement.value = request.data.error;
      }
      console.log("failed to send")
      inputElement.value = request.data.error;
    }
  }

  async removeFriend(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    const request = await axios.post(
      "http://localhost:3333/social/remove_friend",
      JSON.stringify({
        removerUsername: sessionStorage.getItem("username"),
        removedUsername: event.currentTarget.dataset.name,
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

  private async openFriendChat(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    const response = await axios.post(
      "http://localhost:3333/social/friend_chat/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        friendUsername: event.currentTarget.dataset.name,
        refreshToken: sessionStorage.getItem("refreshToken"),
        accessToken: sessionStorage.getItem("accessToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === false)
      return
    sessionStorage.setItem("refreshToken", response.data.refreshToken);
    sessionStorage.setItem("accessToken", response.data.accessToken);
    console.log("chat", response.data.chat)
    this.setState({ chat: response.data.chat });
    console.log("after setState");
  }


  render(): JSX.Element {
    return (
      <div>
        {this.state.friends ? (
          <div className="friends">
            <p className='friends-p'>Friends</p>
            {this.state.friends.map((username) => (
              <div key={username} className="friend">
                <div className="friend-name" data-name={username}>{username}</div>
                <button className="friend-chat-button" onClick={this.openFriendChat} data-name={username}>Chat</button>
                <button className="friend-delete-button" onClick={this.removeFriend} data-name={username}>Delete</button>
                {/* <div className="friend-status" data-name={username}>{status}</div> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="friends">Loading...</div>
        )}
        <div className="add-friend">
          <p className="add-friend-text">Add Friend</p>
          <input className="add-friend-input" type="text" />
          <button className="add-friend-button" onClick={this.sendFriendRequest}>Send</button>
        </div>
        {this.state.friendRequests ? (
          <FriendRequests friendRequests={this.state.friendRequests} />
        ) : (
          <div className="friend-requests">Loading...</div>
        )}
        {this.state.chat ? (
          <Chat chat={this.state.chat} />
        ) : (
          <div className="chat">Loading...</div>
        )}
      </div>
    );
  }
}
