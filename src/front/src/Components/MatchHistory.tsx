import React, { Component } from 'react';
import './css/MatchHistory.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { match } from 'assert';

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

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

        const response = await axios.post('http://' + domain + ':3333/profile/match_history/',
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
            this.setState({ matches: response.data.matches.reverse() })
            return;
        }
        else {
            console.log("failed to retrieve match history")
            console.log(response.data.error)
            return;
        }
    }

    matchDecoder(match: string) {
        // the string is formatted like this: "L:dokzaodi W:teodpzja 8 - 11" or "W:teodpzja L:teodpzja 11 - 9"

        let winner = match.split(" ")[0].split(":")[1]
        let loser = match.split(" ")[1].split(":")[1]
        let winnerScore = parseInt(match.split(" ")[2].split("-")[0])
        let loserScore = parseInt(match.split(" ")[4])
        if (winner == sessionStorage.getItem("username")) {
            return { leftLetter: "W", rightLetter: "L", leftUsername: winner, rightUsername: loser, leftScore: winnerScore, rightScore: loserScore }
        }
        else {
            return { leftLetter: "L", rightLetter: "W", leftUsername: loser, rightUsername: winner, leftScore: loserScore, rightScore: winnerScore }
        }
    }

    render() {
        return (
            <div className='match-history-div'>
                {this.state.matches?.map((match, index) => {
                    let matchObj = this.matchDecoder(match)
                    setTimeout((index) => {
                        let leftLetter = document.querySelectorAll('.match-left-letter')[index] as HTMLElement;
                        leftLetter.style.color = matchObj.leftLetter == "W" ? "green" : "red";
                        let leftUsername = document.querySelectorAll('.match-left-username')[index] as HTMLElement;
                        leftUsername.style.color = matchObj.leftLetter == "W" ? "green" : "red";
                        let rightLetter = document.querySelectorAll('.match-right-letter')[index] as HTMLElement;
                        rightLetter.style.color = matchObj.rightLetter == "W" ? "green" : "red";
                        let rightUsername = document.querySelectorAll('.match-right-username')[index] as HTMLElement;
                        rightUsername.style.color = matchObj.rightLetter == "W" ? "green" : "red";
                    }, 75, index)
                    return (
                        <div className='match-history-match-div' key={index}>
                            <div className='match-history-match-info-div'>
                                <p className='match-left-letter'>{matchObj.leftLetter}</p>
                                <p className='match-left-username'>{matchObj.leftUsername}</p>
                                <p className='match-left-score'>{matchObj.leftScore}</p>
                                <p className='match-right-letter'>{matchObj.rightLetter}</p>
                                <p className='match-right-username'>{matchObj.rightUsername}</p>
                                <p className='match-right-score'>{matchObj.rightScore}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    }
}

export default withParams(MatchHistory);
