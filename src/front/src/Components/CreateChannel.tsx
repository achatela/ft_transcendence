import React from 'react';
import { Component } from 'react';
import './css/CreateChannel.css';
import axios from 'axios';

interface IProps {
}

interface IState {
}

export default class CreateChannel extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
        }
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
                channelPassword: channelPasswordInput.value,
                isPrivate: privateCheckbox.checked
            }),
            { headers: { "Content-Type": "application/json" } })
        if (request.data.success === true) {
            sessionStorage.setItem("refreshToken", request.data.refreshToken);
            sessionStorage.setItem("accessToken", request.data.accessToken);
            console.log("channel created")
        }
        else {
            console.log("failed to create channel")
            console.log(request.data.error)
        }
    }

    render() {
        return (
            <div>
                <div className='create-channel-div'>
                    <p className='channel-name-create'>Channel name</p>
                    <input className='input-name-create' type="text" />
                    <p className='channel-password-create' >Password (optionnal)</p>
                    <input className='input-password-create' type="text" />
                    <p className='channel-private-create'>Private</p>
                    <input className='private-checkbox-create' type="checkbox" />
                    <button className='create-button-create' onClick={this.createChannel} >Create</button>
                </div>
            </div>
        )
    }
}
