import React from 'react';
import { Component } from 'react';
import './css/CreateChannel.css';
import axios from 'axios';
var bcrypt = require('bcryptjs');

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

interface IProps {
    refetchChannels: () => void,
}

interface IState {
    channelCreated: boolean,
    channelError: boolean,
    errorMessage: string,
}

export default class CreateChannel extends Component<IProps, IState> {
    refetchChannels: () => void;
    constructor(props: IProps) {
        super(props);
        this.state = {
            channelCreated: false,
            channelError: false,
            errorMessage: "",
        }
        this.createChannel = this.createChannel.bind(this);
        this.refetchChannels = props.refetchChannels;
    }

    async createChannel() {
        const channelNameInput = document.querySelector('.input-name-create') as HTMLInputElement;
        const channelPasswordInput = document.querySelector('.input-password-create') as HTMLInputElement;
        const privateCheckbox = document.querySelector('.private-checkbox-create') as HTMLInputElement;
        const hasPassword = channelPasswordInput.value.length > 0 ? true : false;
        console.log(sessionStorage.getItem("username"))
        console.log(sessionStorage.getItem("accessToken"))
        console.log(sessionStorage.getItem("refreshToken"))
        try {
            const request = await axios.post('http://' + domain + ':3333/channel/create/',
                JSON.stringify({
                    username: sessionStorage.getItem("username"),
                    accessToken: sessionStorage.getItem("accessToken"),
                    refreshToken: sessionStorage.getItem("refreshToken"),
                    channelName: channelNameInput.value,
                    hasPassword: hasPassword,
                    password: bcrypt.hashSync(channelPasswordInput.value, 10),
                    isPrivate: privateCheckbox.checked
                }),
                { headers: { "Content-Type": "application/json" } })
            if (request.data.success === true) {
                sessionStorage.setItem("refreshToken", request.data.refreshToken);
                sessionStorage.setItem("accessToken", request.data.accessToken);
                this.setState({ channelCreated: true, channelError: false })
                this.refetchChannels();
                return;
            }
            else {
                console.log("failed to create channel")
                alert(request.data.error)
                // this.setState({ channelCreated: false, channelError: true, errorMessage: request.data.error })
                return;
            }
        }
        catch (err) {
            console.log(err);
            return;
        }
    }

    render() {
        return (
            <div>
                <div className='create-channel-div'>
                    {this.state.channelCreated == true ? <p className='channel-created'>Channel created</p> : null}
                    {this.state.channelError == true ? <p className='channel-error'>{this.state.errorMessage}</p> : null}
                    <p className='channel-name-create'>Channel name</p>
                    <input className='input-name-create' type="text" />
                    <p className='channel-password-create' >Password (optionnal)</p>
                    <input className='input-password-create' type="password" />
                    <p className='channel-private-create'>Private</p>
                    <input className='private-checkbox-create' type="checkbox" />
                    <button className='create-button-create' onClick={this.createChannel} >Create</button>
                </div>
            </div >
        )
    }
}
