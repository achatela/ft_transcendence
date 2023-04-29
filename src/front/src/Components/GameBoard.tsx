import React, { Component } from 'react';
import './css/GameBoard.css';

interface IProps{}

interface IState {
    ballX: number;
    ballY: number;
    ballDirectionX: number;
    ballDirectionY: number;
    leftPlayerScore: number;
    rightPlayerScore: number;
    leftPaddleY: number;
    rightPaddleY: number;
}

class GameBoard extends Component<IProps, IState> {
    interval: NodeJS.Timer;
    squareSize: number;
    constructor(props: IProps) {
        super(props);
        this.state = {
            leftPaddleY: 400,
            rightPaddleY: 100,
            ballDirectionX: Math.random() * 2 - 1,
            ballDirectionY: Math.random() * 2 - 1,
            leftPlayerScore: 0,
            rightPlayerScore: 0,
            ballX: 100,
            ballY: 100,
        };
        this.interval = setInterval(() => {}, 10);
        this.squareSize = 40;
    }

    componentDidMount() {
        this.interval = setInterval(this.renderBall, 10);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    renderBall = () => {
        const magnitude = Math.sqrt(this.state.ballDirectionX ** 2 + this.state.ballDirectionY ** 2);
        const borders = document.querySelector('.gameBoard');
        const left = document.querySelector('.leftPaddle');
        const right = document.querySelector('.rightPaddle');
        const speedMultiplier:number = 5;
        // @ts-ignore: Object is possibly 'null'.
        const rect = borders.getBoundingClientRect();
        // @ts-ignore: Object is possibly 'null'.
        const rectLeft = left.getBoundingClientRect();
        // @ts-ignore: Object is possibly 'null'.
        const rectRight = right.getBoundingClientRect();


        let normalisedSpeedX = (this.state.ballDirectionX / magnitude) * speedMultiplier;
        let normalisedSpeedY = (this.state.ballDirectionY / magnitude) * speedMultiplier;
    
        const newX = this.state.ballX + normalisedSpeedX;
        const newY = this.state.ballY + normalisedSpeedY;
        // Handle collisions
        if (newY < 0) {
            this.setState((prevState) => ({
                ballDirectionY: -prevState.ballDirectionY,
              }));
        }
        else if (newX < 0) {
            this.setState((prevState) => ({
                rightPlayerScore: prevState.rightPlayerScore + 1,
                ballX: 100, // change to be in the middle
                ballY: 100, // change to be in the middle
                ballDirectionY: Math.random() * 2 - 1,
                ballDirectionX: Math.random() * 2 - 1,
              }));
        }
        else if (newY + this.squareSize >= rect.bottom - rect.top) {
            this.setState(prevState => ({
                ballDirectionY: -prevState.ballDirectionY,
                }));
        }
        else if (newX + this.squareSize >= rect.right - rect.left) {
            this.setState((prevState) => ({
                leftPlayerScore: prevState.leftPlayerScore + 1,
                ballX: 100, // change to be in the middle
                ballY: 100, // change to be in the middle
                ballDirectionY: Math.random() * 2 - 1,
                ballDirectionX: Math.random() * 2 - 1,
              }));
        }
        // Find condition for left paddle collision (no matter which part, change x direction)

        // Find condition for right paddle collision (no matter which part, change x direction)
        else {
            this.setState(prevState => ({
                ballX: newX,
                ballY: newY
            }));
        }
    };
    

    render() {
        return (
            <div className="gameBoard">
                <p className="leftScore">{this.state.leftPlayerScore}</p>
                <p className="rightScore">{this.state.rightPlayerScore}</p>
                <div className="leftPaddle" style={{top: this.state.leftPaddleY}}></div>
                <div className="ball" style={{ left: this.state.ballX, top: this.state.ballY}}></div>
                <div className="rightPaddle" style={{top: this.state.rightPaddleY}}></div>
            </div>
        );
    }
}

export default GameBoard;
