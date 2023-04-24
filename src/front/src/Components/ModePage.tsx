import { Component } from 'react';
import './css/ModePage.css'

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

    componentDidMount(): void {
        this.getCurrentPlayer()
            .then(currentPlayers => {
                this.setState({ currentPlayers });
            })
            .catch(error => {
                console.error("Error fetching current players:", error);
            });
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