import React from 'react';
import { Component } from 'react';
import './css/CreateChannel.css';
import axios from 'axios';

interface IProps {
}

interface IState {
    channelCreated: boolean,
    channelError: boolean,
    errorMessage: string,
}

export default class CreateChannel extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            channelCreated: false,
            channelError: false,
            errorMessage: "",
        }
        this.createChannel = this.createChannel.bind(this);
    }

    async createChannel() {
        const channelNameInput = document.querySelector('.input-name-create') as HTMLInputElement;
        const channelPasswordInput = document.querySelector('.input-password-create') as HTMLInputElement;
        const privateCheckbox = document.querySelector('.private-checkbox-create') as HTMLInputElement;
        const request = await axios.post('http://localhost:3333/channel/create/',
            JSON.stringify({
                username: sessionStorage.getItem("username"),
                accessToken: sessionStorage.getItem("accessToken"),
                refreshToken: sessionStorage.getItem("refreshToken"),
                channelName: channelNameInput.value,
                password: channelPasswordInput.value,
                isPrivate: privateCheckbox.checked
            }),
            { headers: { "Content-Type": "application/json" } })
        if (request.data.success === true) {
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
            console.log("channel created")
            this.setState({ channelCreated: true, channelError: false })
            return;
        }
        else {
            console.log("failed to create channel")
            console.log(request.data.error)
            this.setState({ channelCreated: false, channelError: true, errorMessage: request.data.error })
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
            </div>
        )
    }
}
