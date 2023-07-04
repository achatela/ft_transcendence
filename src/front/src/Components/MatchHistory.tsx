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
        let profileId;
        if (Number.isNaN(this.state.profileId))
            profileId = 0;
        else
            profileId = this.state.profileId;

        const response = await axios.post('http://localhost:3333/profile/match_history/',
            JSON.stringify({
                username: sessionStorage.getItem("username"),
                accessToken: sessionStorage.getItem("accessToken"),
                refreshToken: sessionStorage.getItem("refreshToken"),
                profileId: profileId,
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
            // if (response.data.error == "Wrong id")
            // window.location.href = "/history"
            console.log("failed to retrieve match history")
            console.log(response.data.error)
            return;
        }
    }

    render() {
        console.log("rednering match history")
        return (
            <div className='match-history-div'>
                {this.state.matches?.map((match, index) => {
                    return (
                        <div className='match-history-match-div' key={index}>
                            {/* <div className='match-history-match-id-div'>
                                <p className='match-history-match-id-text'>Match {index + 1}</p>
                            </div> */}
                            <div className='match-history-match-info-div'>
                                <p className='match-history-match-info-text'>{match}</p>
                            </div>
                        </div>
                    )
                })
                }
            </div>
        );
    }
}

export default withParams(MatchHistory);
