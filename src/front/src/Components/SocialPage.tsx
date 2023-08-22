import React, { Component } from "react";
import axios from "axios";
import "./css/SocialPage.css";
import FriendRequests from "./FriendRequests";
import Chat from "./Chat";
import { promises } from "dns";
import CreateChannel from "./CreateChannel";
import JoinChannel from "./JoinChannel";

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

let avatarUrls: Map<string, string> = new Map<string, string>();
let status: Map<string, string> = new Map<string, string>();

interface IProps { }

interface IState {
  friendRequests: string[] | null;
  friends: string[] | null;
  blockedIds: number[] | null;
  chat: { room: string; messages: [{ senderId: string, text: string, time: string, username: string, avatar: string }] } | null;
  contextMenu: { username: string, position: { x: number, y: number } } | null;
  refresh: boolean;
  selectedChat: string | null;
  createChannel: boolean;
  joinChannel: boolean;
  isChannel: boolean;
  errorMessage: string;
  isError: boolean;
  addFriend: boolean;
  blockUser: boolean;
  section: string;
}

export default class SocialPage extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    var handleChannelClick = this.handleChannelClick.bind(this);
    this.state = {
      friendRequests: null,
      friends: null,
      blockedIds: null,
      chat: null,
      contextMenu: null,
      refresh: false,
      selectedChat: null,
      createChannel: false,
      joinChannel: false,
      isChannel: false,
      errorMessage: "",
      isError: false,
      addFriend: false,
      blockUser: false,
      section: "friends",
    };
  }

  async joinChannel(channelName: string, password?: string) {
    const request = await axios.post(
      'http://' + domain + ':3333/channel/join/',
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
        password: password,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      console.log("joined channel successfully")
      sessionStorage.setItem("refreshToken", request.data.refreshToken);
      sessionStorage.setItem("accessToken", request.data.accessToken);
      this.setState({ isError: false })
      return true;
    }
    else {
      console.log("failed to join channel");
      console.log(request.data.error);
      this.setState({ errorMessage: request.data.error, isError: true });
      return false;
    }
  }
  async handleChannelClick(channelName: string, password?: string) {
    const check = await this.joinChannel(channelName, password)
    if (check === false) {
      return;
    }
    const request = await axios.post(
      'http://' + domain + ':3333/channel/get_channel_messages/',
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        channelName: channelName,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      sessionStorage.setItem("refreshToken", request.data.refreshToken);
      sessionStorage.setItem("accessToken", request.data.accessToken);
      this.setState({ chat: request.data.chat, selectedChat: channelName });
    } else {
      console.log("failed to get channel messages");
      console.log(request.data.error);
    }
    this.setState({ createChannel: false, joinChannel: false, isChannel: true });
  }

  async getFriendRequests(): Promise<string[]> {
    const response = await axios.post(
      'http://' + domain + ':3333/social/friend_request/',
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
      'http://' + domain + ':3333/social/friends/',
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
        this.getStatus(response.data.friends[friend]);
      }
      return response.data.friends;
    }
    else {
      console.log("failed")
    }
  }

  async getBlockedIds(): Promise<number[]> {
    const response = await axios.post(
      'http://' + domain + ':3333/social/blocked_ids/',
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
      return response.data.blockedIds;
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
    const blockedIds = await this.getBlockedIds();
    this.setState({ blockedIds: blockedIds })
    if (sessionStorage.getItem("refresh") == "true") {
      this.setState({ joinChannel: true });
      sessionStorage.setItem("refresh", "false");
    }
    const elem = document.querySelector('.friends') as HTMLElement
    elem.style.backgroundColor = "grey";
  }

  async sendFriendRequestEnter(): Promise<void> {
    let inputElement = document.querySelector(".add-friend-input") as HTMLInputElement;
    const request = await axios.post(
      'http://' + domain + ':3333/social/send_friend_request/',
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
      'http://' + domain + ':3333/social/send_friend_request/',
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
      'http://' + domain + ':3333/social/remove_friend',
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
    window.location.href = "/social/";
    return;
  }

  async getFriendChat(username: string): Promise<{ room: string, messages: [{ senderId: string, text: string, time: string, username: string, avatar: string }] }> {
    const response = await axios.post(
      'http://' + domain + ':3333/social/friend_chat/',
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
      'http://' + domain + ':3333/social/get_friend_id/',
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        friendUsername: event.currentTarget.dataset.name,
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      window.location.href = "/profile/" + request.data.id;
    }
    else {
      console.error("failed to get friend id");
    }
  }

  async getAvatar(username: string): Promise<void> {
    const request = await axios.post(
      'http://' + domain + ':3333/social/get_avatar/',
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


  async getStatus(username: string) {
    const request = await axios.post(
      'http://' + domain + ':3333/social/get_status/',
      JSON.stringify({
        username: username,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      status.set(username, request.data.status)
      if (this.state.refresh === false)
        this.setState({ refresh: true })
      if (this.state.refresh === true)
        this.setState({ refresh: false })
      console.log("got status")
    }
    else
      console.error("failed to get status");
  }

  async blockUser(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    let inputElement = document.querySelector(".block-user-input") as HTMLInputElement;
    const request = await axios.post(
      'http://' + domain + ':3333/social/block_user/',
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        blockedUsername: inputElement.value,
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      sessionStorage.setItem("refreshToken", request.data.refreshToken);
      sessionStorage.setItem("accessToken", request.data.accessToken);
      console.log("blocked")
    }
    else
      console.log("failed to block")
    window.location.href = "/social"
  }

  async blockUserEnter() {
    let inputElement = document.querySelector(".block-user-input") as HTMLInputElement;
    const request = await axios.post(
      'http://' + domain + ':3333/social/block_user/',
      JSON.stringify({
        username: sessionStorage.getItem("username"),
        blockedUsername: inputElement.value,
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (request.data.success === true) {
      sessionStorage.setItem("refreshToken", request.data.refreshToken);
      sessionStorage.setItem("accessToken", request.data.accessToken);
      console.log("blocked")
    }
    else
      console.log("failed to block")
    window.location.href = "/social"
  }


  handleButtonsClick() {
    this.setState({ createChannel: false, joinChannel: false, chat: null, selectedChat: null })
  }

  render(): JSX.Element {
    return (
      < div onClick={() => {
        if (this.state.contextMenu)
          this.setState({ contextMenu: null, isError: false });
      }}>
        {/* <button className="close-chat" onClick={() => { this.setState({ chat: null }); this.setState({ isError: false, isChannel: false, joinChannel: false, createChannel: false, selectedChat: null }) }}>home</button> */}
        {
          this.state.isError === true ? (
            <p className="error-message">{this.state.errorMessage}</p>
          ) : null
        }
        <div className="friend-channel-div">
          <div className="friends"
            onClick={async () => {
              const elem = document.querySelector('.friends') as HTMLElement
              const elem2 = document.querySelector('.channels') as HTMLElement
              elem.style.backgroundColor = 'grey';
              elem2.style.backgroundColor = 'black';
              this.setState({ section: "friends", chat: null, selectedChat: null });
            }
            }
          >
            Friends
          </div>
          <div className="channels"
            onClick={async () => {
              const elem = document.querySelector('.friends') as HTMLElement
              const elem2 = document.querySelector('.channels') as HTMLElement
              elem.style.backgroundColor = 'black';
              elem2.style.backgroundColor = 'grey';
              this.setState({ section: "channels", chat: null, selectedChat: null });
            }
            }
          >
            Channels
          </div>
        </div>
        {
          this.state.section === "friends" ? (
            <div className="friends-section">

              {this.state.friendRequests ? (<FriendRequests friendRequests={this.state.friendRequests} />) :
                (<div className="friend-requests">Loading...</div>)
              }
              {
                this.state.friends ? (
                  <div className="friends-list">
                    {/* <p className='friends-p'>Friends</p> */}
                    {this.state.friends.map((username) => (
                      <div key={username} className="friends-friend" style={this.state.selectedChat === username ? { backgroundColor: 'grey' } : {}}
                        onClick={async () => {
                          const chat = await this.getFriendChat(username);
                          this.setState({ selectedChat: username, isError: false, isChannel: false })
                          this.setState({ chat: chat });
                        }
                        } onContextMenu={
                          (e) => {
                            e.preventDefault();
                            this.setState({ contextMenu: { username: username, position: { x: e.pageX, y: e.pageY } }, isError: false });
                          }}>
                        <div className="friend-avatar" style={{ backgroundImage: `url(${avatarUrls.get(username)})` }}></div>
                        <div className="friend-name" data-name={username}>{username}</div>
                        <div className="friend-status">{status.get(username)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="friends">Loading...</div>
                )
              }
              {
                this.state.contextMenu && (
                  <div className="friend-context" style={{ top: this.state.contextMenu.position.y, left: this.state.contextMenu.position.x }}>
                    <button className="friend-profile" onClick={this.seeProfile} data-name={this.state.contextMenu.username}>see profile</button>
                    <button className="friend-remove" onClick={this.removeFriend} data-name={this.state.contextMenu.username}>remove friend</button>
                  </div>
                )
              }
              <div className="add-friend">
                {this.state.addFriend === true || this.state.blockUser === true ? (
                  <button className="reset-states" onClick={() => { this.setState({ addFriend: false, blockUser: false }) }}>X</button>
                ) : <>
                  <button className="display-add" onClick={() => { this.setState({ addFriend: true }) }}>Add friend</button>
                  <button className="display-block" onClick={() => { this.setState({ blockUser: true }) }}>Block user</button>
                </>}
                {this.state.addFriend === true ? (<>
                  <p className="add-friend-text">Add Friend</p>
                  <input className="add-friend-input" type="text" onKeyUp={(e) => { if (e.key === 'Enter') { this.sendFriendRequestEnter() } }} />
                  <button className="add-friend-button" onClick={this.sendFriendRequest}>Send</button>
                </>
                ) : null}
                {this.state.blockUser === true ? (<>
                  <p className="block-user-text">Block User</p>
                  <input className="block-user-input" type="text" onKeyUp={(e) => { if (e.key === 'Enter') { this.blockUserEnter() } }} />
                  <button className="block-user-button" onClick={this.blockUser}>Block</button>
                </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="channels">
              <JoinChannel handleChannelClick={this.handleChannelClick.bind(this)} handleButtonsClick={this.handleButtonsClick.bind(this)} />
              {/* {this.state.createChannel === false && this.state.joinChannel === false ? (
                <>
                  <button className="create-channel" onClick={() => { this.setState({ createChannel: true, isError: false }) }}>Create a channel</button>
                  <button className="join-channel" onClick={() => { this.setState({ joinChannel: true, isError: false }) }} >Join a channel</button>
                </>
              ) : (
                this.state.createChannel === true ? (
                  <CreateChannel />
                ) : (
                  <JoinChannel handleChannelClick={this.handleChannelClick.bind(this)} />
                )
              )} */}
            </div>
          )
        }
        {
          this.state.chat ? (
            <Chat isChannel={this.state.isChannel} chat={this.state.chat} isSelected={this.state.selectedChat} blockedIds={this.state.blockedIds} />
          ) : (
            <></>
          )
        }

      </div >
    );
  }
}
