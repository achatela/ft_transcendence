import React, { Component } from "react";
import axios from "axios";
import "./css/SocialPage.css";
import FriendRequests from "./FriendRequests";
import Chat from "./Chat";
import { promises } from "dns";

let avatarUrls: Map<string, string> = new Map<string, string>();

interface IProps { }

interface IState {
  friendRequests: string[] | null;
  friends: string[] | null;
  chat: { room: string; messages: [{ senderId: string, text: string, time: string, username: string, avatar: string }] } | null;
  contextMenu: { username: string, position: { x: number, y: number } } | null;
  refresh: boolean;
  selectedChat: string | null;
}

export default class SocialPage extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      friendRequests: null,
      friends: null,
      chat: null,
      contextMenu: null,
      refresh: false,
      selectedChat: null,
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
      for (let friend in response.data.friends) {
        this.getAvatar(response.data.friends[friend]);
      }
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

  async sendFriendRequestEnter(): Promise<void> {
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

  async getFriendChat(username: string): Promise<{ room: string, messages: [{ senderId: string, text: string, time: string, username: string, avatar: string }] }> {
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
      return;
    sessionStorage.setItem("refreshToken", response.data.refreshToken);
    sessionStorage.setItem("accessToken", response.data.accessToken);
    return response.data.chat
  }

  async seeProfile(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    console.log(event.currentTarget.dataset.name);
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

  async getAvatar(username: string): Promise<void> {
    console.log(username)
    const request = await axios.post(
      "http://localhost:3333/social/get_avatar/",
      JSON.stringify({
        username: username,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      avatarUrls.set(username, request.data.avatar)
      if (this.state.refresh === false)
        this.setState({ refresh: true })
      if (this.state.refresh === true)
        this.setState({ refresh: false })
      console.log("got avatar")
    }
    else
      console.error("failed to get avatar");
  }

  render(): JSX.Element {
    return (
      <div onClick={() => {
        if (this.state.contextMenu)
          this.setState({ contextMenu: null });
      }}>
        {this.state.friends ? (
          <div className="friends">
            <p className='friends-p'>Friends</p>
            {this.state.friends.map((username) => (
              <div key={username} className="friends-friend" style={this.state.selectedChat === username ? { backgroundColor: 'grey' } : {}}
                onClick={async () => {
                  const chat = await this.getFriendChat(username);
                  this.setState({ selectedChat: username })
                  this.setState({ chat: chat });
                }
                } onContextMenu={
                  (e) => {
                    e.preventDefault();
                    this.setState({ contextMenu: { username: username, position: { x: e.pageX, y: e.pageY } } });
                  }}>
                <div className="friend-avatar" style={{ backgroundImage: `url(${avatarUrls.get(username)})` }}></div>
                <div className="friend-name" data-name={username}>{username}</div>
                {/* <div className="friend-status" data-name={username}>{status}</div> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="friends">Loading...</div>
        )}
        {this.state.contextMenu && (
          <div className="friend-context" style={{ top: this.state.contextMenu.position.y, left: this.state.contextMenu.position.x }}>
            <button className="friend-profile" onClick={this.seeProfile} data-name={this.state.contextMenu.username}>see profile</button>
            <button className="friend-remove" onClick={this.removeFriend} data-name={this.state.contextMenu.username}>remove friend</button>
          </div>
        )}
        <div className="add-friend">
          <p className="add-friend-text">Add Friend</p>
          <input className="add-friend-input" type="text" onKeyUp={(e) => { if (e.key === 'Enter') { this.sendFriendRequestEnter() } }} />
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
          <div></div>
        )}
      </div>
    );
  }
}
