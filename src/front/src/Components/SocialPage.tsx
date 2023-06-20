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
  contextMenu: {visible: boolean, position: { x: number, y: number }}
}

export default class SocialPage extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      friendRequests: null,
      friends: null,
      chat: null,
      contextMenu: {visible: false, position: { x: 0, y: 0 }}
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

  async getFriendChat(username: string): Promise<{ room: string, messages: string[] }> {
    const response = await axios.post(
      "http://localhost:3333/social/friend_chat/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        friendUsername: username,
        refreshToken: sessionStorage.getItem("refreshToken"),
        accessToken: sessionStorage.getItem("accessToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.success === false)
      return
    sessionStorage.setItem("refreshToken", response.data.refreshToken);
    sessionStorage.setItem("accessToken", response.data.accessToken);
    return response.data.chat
  }

  async seeProfile(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    console.log("in see profile");
    const request = await axios.post(
      "http://localhost:3333/social/get_friend_id/",
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        friendUsername: event.currentTarget.dataset.name,
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      window.location.href = "http://localhost:3133/profile/" + request.data.id;
    }
    else {
      console.error("failed to get friend id");
    }
  }

  // let element = document.querySelector("#elementId");
  // let window = document.querySelector("#windowId");

  // element.addEventListener("contextmenu", function(event) {
  //   event.preventDefault();
  //   toggleWindow();
  // });

  // function toggleWindow() {
  // if (window.style.display === "none") {
  //   window.style.display = "block";
  // } else {
  //   window.style.display = "none";
  // }
  // }

  render(): JSX.Element {
    return (
      // <div onClick={() => {
      //   if (this.state.contextMenu.visible)
      //    this.setState({contextMenu: {visible: false, position: { x: 0, y: 0 }}});
      // }}>
      <div className="social">
        {this.state.contextMenu.visible && (
        <div className="context-menu">
          <button onClick={() => {console.log("see profile")}} style={{color:'black'}}>see profile</button>
          <button onClick={() => {console.log("remove friend")}} style={{color:'black'}}>remove friend</button>
        </div>
        )}
        {this.state.friends ? (
          <div className="friends">
            <p className='friends-p'>Friends</p>
            {this.state.friends.map((username) => (
              <div key={username} className="friend" onContextMenu={
                (e) => {
                  e.preventDefault();
                  this.setState({contextMenu: {visible: true, position: {x: e.pageX, y: e.pageY}}});
                }}>
                <div className="friend-name" data-name={username}>{username}</div>
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
