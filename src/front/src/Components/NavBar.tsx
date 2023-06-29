import React, { Component } from 'react';
import './css/NavBar.css';

interface IProps {
}

interface IState {
    isSpread: boolean,
}

export default class NavBar extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isSpread: false,
        }
    }

    render() {
        return (
            <div>
                <div className='menu-button' onClick={() => { this.setState({ isSpread: true }) }}></div>
                {this.state.isSpread == true ? (
                    <div className='menu'>
                        <button className='close-menu' onClick={() => { this.setState({ isSpread: false }) }} >X</button>
                        <div onClick={() => { window.location.href = "/social" }} className='menu-social'>Friends/Channels</div>
                        <div onClick={() => { window.location.href = "/mode" }} className='menu-play'>Play Game</div>
                        <div onClick={() => { window.location.href = "/profile" }} className='menu-profile'>Profile</div>
                    </div>
                )
                    : null
                }
            </div>
        )
    }
}
