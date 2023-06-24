import React from 'react';
import { Component } from 'react';
import './css/JoinChannel.css';
import axios from 'axios';

interface IProps {
    handleChannelClick: (channelName: string) => void;
}

interface IState {
    channels: [{ channelName: string, users: number, hasPassword: boolean, owner: string }] | null;

}

export default class JoinChannel extends Component<IProps, IState> {
    handleChannelClick: (channelName: string) => void;
    constructor(props: IProps) {
        super(props);
        this.state = {
            channels: null
        }
        this.handleChannelClick = props.handleChannelClick;
    }

    async componentDidMount() {
        const request = await axios.post('http://localhost:3333/channel/getChannels/',
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

    render() {
        return (
            <div className='join-channel-div'>
                <div className='your-channels-div'>
                    <div className='your-channels-header'>
                        <p className='your-channels-p'>Your channels</p>
                    </div>
                    <div className='your-channels-list'></div>
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
                                <div className='channel-list-item' key={index}>
                                    <div onClick={() => this.handleChannelClick(channel.channelName)}>
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