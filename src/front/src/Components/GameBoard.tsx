import React, { Component } from 'react';
import './css/GameBoard.css';

const upArrow:number = 38;
const downArrow:number = 40;
const zKey:number = 90;
const sKey:number = 83;
const speedMultiplier:number = 2;
const paddleStep:number = 10;
const paddleHeight:number = 100;

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
            ballX: 450,
            ballY: 300,
        };
        this.interval = setInterval(() => {}, 10);
        this.squareSize = 40;
    }

    componentDidMount() {
        const borders = document.querySelector('.gameBoard')
        // @ts-ignore: Object is possibly 'null'.
        const rect = borders.getBoundingClientRect();
        let bottomBorder = rect.bottom - rect.top;
 
        this.interval = setInterval(this.renderBall, 10);
        document.addEventListener('keydown', (event) => {
            if (event.keyCode === upArrow) {
                if (this.state.rightPaddleY < paddleStep){
                    this.setState((prevState) => ({
                        rightPaddleY: 0,
                      }));
                }
                else {
                    this.setState((prevState) => ({
                        rightPaddleY: prevState.rightPaddleY - paddleStep,
                      }));
                }
            }
            else if (event.keyCode === downArrow) {
                if (this.state.rightPaddleY + paddleHeight + paddleStep > bottomBorder)
                    this.setState((prevState) => ({
                        rightPaddleY: bottomBorder - paddleHeight - 4,
                    }));
                else
                    this.setState((prevState) => ({
                        rightPaddleY: prevState.rightPaddleY + paddleStep,
                        }));
            }
            else if (event.keyCode === zKey){
                if (this.state.leftPaddleY < paddleStep){
                    this.setState((prevState) => ({
                        leftPaddleY: 0,
                      }));
                }
                else {
                    this.setState((prevState) => ({
                        leftPaddleY: prevState.leftPaddleY - paddleStep,
                      }));
                }
            }
            else if (event.keyCode === sKey){
                if (this.state.leftPaddleY + paddleHeight + paddleStep > bottomBorder)
                    this.setState((prevState) => ({
                        leftPaddleY: bottomBorder - paddleHeight - 4,
                    }));
                else
                    this.setState((prevState) => ({
                        leftPaddleY: prevState.leftPaddleY + paddleStep,
                        }));
            }
        }
        );
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        // Needs to remove event listener
    }

    checkLeftCollision(rect:DOMRect, x:number, y:number, squareSize:number) {
        if ((x < 70 && x > 50) && (y > this.state.leftPaddleY && y < this.state.leftPaddleY + 100))
            return 0;
        return 1;
    }

    checkRightCollision(rect:DOMRect, x:number, y:number, squareSize:number, compensate:number) {
        if ((x > rect.left - (compensate / 2) - 50 && x < rect.left - (compensate / 2) - 30) && (y > this.state.rightPaddleY && y < this.state.rightPaddleY + 100))
            return 0;
        return 1;
    }

    renderBall = () => {
        const magnitude = Math.sqrt(this.state.ballDirectionX ** 2 + this.state.ballDirectionY ** 2);
        const borders = document.querySelector('.gameBoard');
        const left = document.querySelector('.leftPaddle');
        const right = document.querySelector('.rightPaddle');
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
        // Handle collisions with the left Paddle
        if (this.checkLeftCollision(rectLeft, newX, newY, this.squareSize) == 0) {
            this.setState((prevState) => ({
                ballDirectionX: -prevState.ballDirectionX,
                }));
        }
        else if (this.checkRightCollision(rectRight, newX, newY, this.squareSize, window.innerWidth - (rect.right - rect.left) - 70) == 0) {
            this.setState((prevState) => ({
                ballDirectionX: -prevState.ballDirectionX,
                }));
        }
        else if (newY < 0) {
            this.setState((prevState) => ({
                ballDirectionY: -prevState.ballDirectionY,
              }));
        }
        else if (newX < 0) {
            this.setState((prevState) => ({
                rightPlayerScore: prevState.rightPlayerScore + 1,
                ballX: 450, // change to be in the middle
                ballY: 300, // change to be in the middle
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
                ballX: 450, // change to be in the middle
                ballY: 300, // change to be in the middle
                ballDirectionY: Math.random() * 2 - 1,
                ballDirectionX: Math.random() * 2 - 1,
              }));
        }
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
