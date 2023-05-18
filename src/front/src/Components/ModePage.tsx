import { Component } from 'react';
import './css/ModePage.css'
import axios from 'axios';

interface IProps {}

interface IState {
    currentPlayers: number;
}

class ModePage extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            currentPlayers: 0
        };
    }

    getCurrentPlayer = async () =>{
        const response = await fetch('http://localhost:3333/player_number');
        const data = await response.json();
        return data.currentPlayers;
    };

    async componentDidMount(): Promise<void> {
        this.getCurrentPlayer()
            .then(currentPlayers => {
                this.setState({ currentPlayers });
            })
            .catch(error => {
                console.error("Error fetching current players:", error);
            });
            const request = await axios.post('http://localhost:3333/auth/refresh_token', JSON.stringify({ refreshToken: sessionStorage.getItem('refreshToken'), login: sessionStorage.getItem('login') }), {headers: { 'Content-Type': 'application/json'}});
            if (request.data.success == true) {
                sessionStorage.setItem("accessToken", request.data.accessToken);
                sessionStorage.setItem("refreshToken", request.data.refreshToken);
            }
            else
                console.error(request.data.error);
            // setInterval(async () => {
            //   const request = await axios.post('http://localhost:3333/auth/refresh_token', JSON.stringify({ refreshToken: sessionStorage.getItem('refreshToken'), login: sessionStorage.getItem('login') }), {headers: { 'Content-Type': 'application/json'}});
            //     if (request.data.success == true) {
            //         sessionStorage.setItem("accessToken", request.data.accessToken);
            //         sessionStorage.setItem("refreshToken", request.data.refreshToken);
            //     }
            //     else
            //         console.error(request.data.error);
            // }, 60000)
    }
    

    // componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void {
    //     this.getCurrentPlayers();
    // }

    render() {
        return (
        <div className="divModePage">
            <p className="modePageTitle">Select a Game Mode: {this.state.currentPlayers}</p>
            <div className="normalGameMode">
                <p className="classicPong">Classic Pong</p>
            <div className="imgPlaceHolder"></div>
            </div>
            <div className="customGameMode">
                <p className="customPong">Custom Pong</p>
                <div className="imgPlaceHolder2"></div>
            </div>
        </div>
        );
    }
}

export default ModePage;