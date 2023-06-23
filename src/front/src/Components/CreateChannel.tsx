import React from 'react';
import { Component } from 'react';
import './css/CreateChannel.css';

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
