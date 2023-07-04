import React from 'react';
import { Component } from 'react';
import './css/JoinChannel.css';
import axios from 'axios';

interface IProps {
    handleChannelClick: (channelName: string) => void;
}

interface IState {
    channels: [{ channelName: string, users: number, hasPassword: boolean, owner: string }] | null;
    yourChannels: [{ channelName: string }] | null;
    channelInvites: [{ channelName: string }] | null;
}

export default class JoinChannel extends Component<IProps, IState> {
    handleChannelClick: (channelName: string, password?: string) => void;
    constructor(props: IProps) {
        super(props);
        this.state = {
            channels: null,
            yourChannels: null,
            channelInvites: null
        }
        this.handleChannelClick = props.handleChannelClick;
    }

    async componentDidMount() {
        const request = await axios.post('http://localhost:3333/channel/get_channels/',
            JSON.stringify({
                username: sessionStorage.getItem("username"),
                accessToken: sessionStorage.getItem("accessToken"),
                refreshToken: sessionStorage.getItem("refreshToken")
            }),
            { headers: { "Content-Type": "application/json" } })
        if (request.data.success === true) {
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
            this.setState({ channels: request.data.channels })
            console.log("channels received")
        }
        else {
            console.log("failed to get channels")
            console.log(request.data.error)
        }
        const request2 = await axios.post('http://localhost:3333/channel/get_your_channels/',
            JSON.stringify({
                username: sessionStorage.getItem("username"),
                accessToken: sessionStorage.getItem("accessToken"),
                refreshToken: sessionStorage.getItem("refreshToken")
            }),
            { headers: { "Content-Type": "application/json" } })
        if (request2.data.success === true) {
            sessionStorage.setItem("refreshToken", request2.data.refreshToken);
            sessionStorage.setItem("accessToken", request2.data.accessToken);
            this.setState({ yourChannels: request2.data.yourChannels })
            console.log("your channels received")
        }
        else {
            console.log("failed to get your channels")
            console.log(request2.data.error)
        }
        const request3 = await axios.post('http://localhost:3333/channel/get_channel_invites/',
            JSON.stringify({
                username: sessionStorage.getItem("username"),
                accessToken: sessionStorage.getItem("accessToken"),
                refreshToken: sessionStorage.getItem("refreshToken")
            }),
            { headers: { "Content-Type": "application/json" } })
        if (request3.data.success === true) {
            sessionStorage.setItem("refreshToken", request3.data.refreshToken);
            sessionStorage.setItem("accessToken", request3.data.accessToken);
            this.setState({ channelInvites: request3.data.channelInvites })
            console.log("channel invites received")
            console.log(request3.data.channelInvites)
        }
        else {
            console.log("failed to get channel invites")
            console.log(request3.data.error)
        }
    }

    async acceptChannelInvite(channelName: string) {
        const request = await axios.post('http://localhost:3333/channel/accept_channel_invite/',
            JSON.stringify({
                username: sessionStorage.getItem("username"),
                accessToken: sessionStorage.getItem("accessToken"),
                refreshToken: sessionStorage.getItem("refreshToken"),
                channelName: channelName,
            }),
            { headers: { "Content-Type": "application/json" } })
        if (request.data.success === true) {
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
            console.log("channel invite accepted")
            window.location.reload();
        }
        else {
            console.log("failed to accept channel invite")
            console.log(request.data.error)
        }
    }

    async declineChannelInvite(channelName: string) {
        const request = await axios.post('http://localhost:3333/channel/decline_channel_invite/',
            JSON.stringify({
                username: sessionStorage.getItem("username"),
                accessToken: sessionStorage.getItem("accessToken"),
                refreshToken: sessionStorage.getItem("refreshToken"),
                channelName: channelName,
            }),
            { headers: { "Content-Type": "application/json" } })
        if (request.data.success === true) {
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
            console.log("channel invite accepted")
            window.location.reload();
        }
        else {
            console.log("failed to accept channel invite")
            console.log(request.data.error)
        }
    }

    render() {
        return (
            <div className='join-channel-div'>
                <div className='your-channels-div'>
                    <div className='your-channels-header'>
                        <p className='your-channels-p'>Your channels</p>
                    </div>
                    <div className='your-channels-list'>
                        {this.state.yourChannels !== null ? this.state.yourChannels.map((channel, index) => {
                            return (
                                <div className='your-channels-list-item' key={index}>
                                    <div onClick={() => this.handleChannelClick(channel.channelName)}>
                                        <p className='your-channels-list-item-name'>{channel.channelName}</p>
                                    </div>
                                </div>
                            )
                        }, this) : null}
                    </div>
                </div>
                <div className='channels-invite'>
                    {/* <div className='channels-header'> */}
                    <p className='channels-invite-p'>Channel invite</p>
                    {/* </div> */}
                    <div className='channels-invite-items'>
                        {this.state.channelInvites !== null ? this.state.channelInvites.map((channelInvite, index) => {
                            return (
                                <div className='channels-invite-list-item' key={index}>
                                    <p className='channels-invite-list-item-name'>{channelInvite.channelName}</p>
                                    <div>
                                        <button className='channels-invite-accept' onClick={() => { this.acceptChannelInvite(channelInvite.channelName) }}>accept</button>
                                        <button className='channels-invite-decline' onClick={() => { this.declineChannelInvite(channelInvite.channelName) }}>decline</button>
                                    </div>
                                </div>
                            )
                        }, this) : null}
                    </div>
                </div>
                <div className='channels-list-div'>
                    <div className='channels-list-header'>
                        <p className='channels-list-p'>Channels list</p>
                    </div>
                    <div className='channel-list'>
                        <div className='channel-list-item-header'>
                            <p className='channel-list-item-name-h'>Channel name</p>
                            <p className='channel-list-item-number-h'>Users</p>
                            <p className='channel-list-item-owner-h'>Owner</p>
                            <p className='channel-list-item-private-h'>Password</p>
                        </div>
                        {this.state.channels !== null ? this.state.channels.map((channel, index) => {
                            return (
                                <div onClick={() => {
                                    if (channel.hasPassword === true) {
                                        for (let yourChannel of this.state.yourChannels) {
                                            if (yourChannel.channelName === channel.channelName) {
                                                this.handleChannelClick(channel.channelName)
                                                return;
                                            }
                                        }
                                        const password = prompt("Enter password for channel " + channel.channelName)
                                        if (password !== null) {
                                            this.handleChannelClick(channel.channelName, password)
                                        }
                                        return;
                                    }
                                    this.handleChannelClick(channel.channelName)
                                }
                                } className='channel-list-item' key={index}>
                                    <div>
                                        <p className='channel-list-item-name'>{channel.channelName}</p>
                                    </div>
                                    <div>
                                        <p className='channel-list-item-number'>{channel.users}</p>
                                    </div>
                                    <div>
                                        <p className='channel-list-item-owner'>{channel.owner}</p>
                                    </div>
                                    <div>
                                        <p className='channel-list-item-private'>{channel.hasPassword ? "Yes" : "No"}</p>
                                    </div>
                                </div>
                            )
                        }
                        ) : null}
                    </div>
                </div>
            </div>)
    }
}