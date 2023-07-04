import React, { Component } from 'react';
import './css/MatchHistory.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';

function withParams(WrappedComponent: React.ComponentType<any>) {
    return (props: any) => {
        const { profileId } = useParams<{ profileId: string }>();
        return <WrappedComponent profileId={profileId} {...props} />;
    };
}

interface IProps {
    profileId: string,
}

interface IState {
    matches: string[] | null,
    profileId: number,
}

class MatchHistory extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            matches: null,
            profileId: parseInt(this.props.profileId)
        }
    }

    async componentDidMount() {
        console.log(this.state.profileId)
        const response = await axios.post('http://localhost:3333/match_history/',
            JSON.stringify({
                username: sessionStorage.getItem("username"),
                accessToken: sessionStorage.getItem("accessToken"),
                refreshToken: sessionStorage.getItem("refreshToken"),
            }),
            { headers: { "Content-Type": "application/json" } })
        if (response.data.success === true) {
            sessionStorage.setItem("refreshToken", response.data.refreshToken);
            sessionStorage.setItem("accessToken", response.data.accessToken);
            console.log("match history retrieved")
            console.log(response.data.matches)
            this.setState({ matches: response.data.matches })
            return;
        }
        else {
            console.log("failed to retrieve match history")
            console.log(response.data.error)
            return;
        }
    }

    render() {
        console.log("rednering match history")
        return (
            <div className='match-history-div'>
                e
            </div>
        );
    }
}

export default withParams(MatchHistory);
