import React from 'react';
import { Component } from 'react';
import './css/JoinChannel.css';
import axios from 'axios';
import CreateChannel from './CreateChannel';

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

interface IProps {
    handleChannelClick: (channelName: string) => void;
    handleButtonsClick: () => void;
}

interface IState {
    channels: [{ channelName: string, users: number, hasPassword: boolean, owner: string }] | null;
    yourChannels: [{ channelName: string }] | null;
    channelInvites: [{ channelName: string }] | null;
    createChannel: boolean;
    joinChannel: boolean;
}

export default class JoinChannel extends Component<IProps, IState> {
    handleChannelClick: (channelName: string, password?: string) => void;
    handleButtonsClick: () => void;
    constructor(props: IProps) {
        super(props);
        this.state = {
            channels: null,
            yourChannels: null,
            channelInvites: null,
            createChannel: false,
            joinChannel: false,
        }
        this.handleChannelClick = props.handleChannelClick;
        this.handleButtonsClick = props.handleButtonsClick;
    }

    async reFetchChannels() {
        try {
            const request = await axios.post('http://' + domain + ':3333/channel/get_channels/',
                JSON.stringify({
                    username: sessionStorage.getItem("username"),
                    accessToken: sessionStorage.getItem("accessToken"),
                    refreshToken: sessionStorage.getItem("refreshToken")
                }),
                { headers: { "Content-Type": "application/json" } }
            )
            if (request.data.success === true) {
                sessionStorage.setItem("refreshToken", request.data.refreshToken);
                sessionStorage.setItem("accessToken", request.data.accessToken);
                this.setState({ channels: request.data.channels }, () => { console.log(this.state.channels) })
                console.log("channels received")
            }
            else {
                console.log("failed to get channels")
                console.log(request.data.error)
            }
        }
        catch(err) {
            console.log(err)
        }
    }

    async componentDidMount() {
        try {
            const request = await axios.post('http://' + domain + ':3333/channel/get_channels/',
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
        }
        catch(err) {
            console.log(err)
        }
        try {
            const request2 = await axios.post('http://' + domain + ':3333/channel/get_your_channels/',
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
        }
        catch(err) {
            console.log(err)
        }
        try {
            const request3 = await axios.post('http://' + domain + ':3333/channel/get_channel_invites/',
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
        catch(err) {
            console.log(err)
        }
    }

    async componentDidUpdate() {
        const elem1 = document.querySelector('.display-join') as HTMLElement;
        if (this.state.joinChannel)
            elem1.style.backgroundColor = 'grey';
        else
            elem1.style.backgroundColor = 'black';
        const elem2 = document.querySelector('.display-create') as HTMLElement;
        if (this.state.createChannel)
            elem2.style.backgroundColor = 'grey';
        else
            elem2.style.backgroundColor = 'black';
    }

    async acceptChannelInvite(channelName: string) {
        try {
            const request = await axios.post('http://' + domain + ':3333/channel/accept_channel_invite/',
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
            }
            else {
                console.log("failed to accept channel invite")
                console.log(request.data.error)
            }
        }
        catch(err) {
            console.log(err)
        }
        sessionStorage.setItem("refresh", "true");
        window.location.href = "/social";
    }

    async declineChannelInvite(channelName: string) {
        try {
            const request = await axios.post('http://' + domain + ':3333/channel/decline_channel_invite/',
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
        catch(err) {
            console.log(err)
        }
        sessionStorage.setItem("refresh", "true");
        window.location.href = "/social";
    }

    render() {
        return (
            <div >
                <div className='your-channels-div'>
                    <div className='your-channels-list'>
                        {this.state.yourChannels !== null ? this.state.yourChannels.map((channel, index) => {
                            return (
                                <div className='your-channels-list-item' key={index}>
                                    <div onClick={() => {
                                        this.handleChannelClick(channel.channelName);
                                        this.setState({ joinChannel: false, createChannel: false })
                                    }}>
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
                <div className='channels-join-create-div'>
                    <button className="display-join" onClick={() => {
                        this.setState({ joinChannel: true });
                        this.setState({ createChannel: false });
                        this.handleButtonsClick();
                    }}>Join</button>
                    <button className="display-create" onClick={() => {
                        this.setState({ createChannel: true });
                        this.setState({ joinChannel: false });
                        this.handleButtonsClick();
                    }}>Create</button>
                    {this.state.createChannel === true ?
                        (
                            <>
                                <CreateChannel refetchChannels={this.reFetchChannels.bind(this)}></CreateChannel>
                            </>
                        )
                        :
                        null}
                    {
                        this.state.joinChannel === true ? (
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
                                                console.log("before join channel")
                                                if (channel.hasPassword === true) {
                                                    for (let yourChannel of this.state.yourChannels) {
                                                        if (yourChannel.channelName === channel.channelName) {
                                                            this.handleChannelClick(channel.channelName)
                                                            this.setState({ joinChannel: false, createChannel: false })
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
                                                this.setState({ joinChannel: false, createChannel: false })
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
                            </div>) : null
                    }
                </div>
            </div>)
    }
}