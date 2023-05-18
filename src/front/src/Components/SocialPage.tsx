import React, { Component } from "react";
import axios from "axios";
import "./css/SocialPage.css";

interface IProps {}

interface IState {}

export default class SocialPage extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    async componentDidMount(): Promise<void> {}

    render(): JSX.Element {
        return (
            <div>
                <h1 className="title">social page</h1>
                <div className="friend-list"></div>
                <div className="chat"></div>
            </div>
        );
    }
}