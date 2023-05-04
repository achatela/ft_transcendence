import React, { Component } from 'react';
import './css/GameBoard.css';

const upArrow:number = 38;
const downArrow:number = 40;
const zKey:number = 90;
const sKey:number = 83;
const speedMultiplier:number = 2;
const paddleStep:number = 10;
const paddleHeight:number = 100;
const paddleWidth:number = 20;
const squareSize:number = 20;

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

    checkPaddleCollision(x:number, y:number, outerSidePos:number, innerSidePos:number, topSidePos:number, bottomSidePos:number) {
        if ((x >= innerSidePos && x <= outerSidePos) && (y >= topSidePos && y <= bottomSidePos)){
            if (x - innerSidePos < y - topSidePos && x - innerSidePos < bottomSidePos - y)
                return 1;
            else if (y - topSidePos < x - innerSidePos){
                if (this.state.ballDirectionY <= 3.14159265359 && this.state.ballDirectionY >= 0)
                    return 2;
                return 3;
            }
            else if (bottomSidePos - y < x - innerSidePos){
                if (this.state.ballDirectionY <= 3.14159265359 && this.state.ballDirectionY >= 0)
                    return 3;
                return 2;
            }
        }
        return 0;
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

        const leftPaddleCollision = this.checkPaddleCollision(newX, newY, 50 + paddleWidth, 50, this.state.leftPaddleY - squareSize, this.state.leftPaddleY + paddleHeight)
        const rightPaddleCollision = this.checkPaddleCollision(newX, newY, rect.right - rect.left - 50 - squareSize, rect.right - rect.left - 50 - squareSize - paddleWidth, this.state.rightPaddleY - squareSize, this.state.rightPaddleY + paddleHeight)

        if (leftPaddleCollision == 1 || rightPaddleCollision == 1) {
            this.setState((prevState) => ({
                ballDirectionX: -prevState.ballDirectionX,
            }));
        }
        else if (leftPaddleCollision == 2 || rightPaddleCollision == 2) {
            this.setState((prevState) => ({
                ballDirectionY: -prevState.ballDirectionY,
            }));
        }
        // else if (leftPaddleCollision == 3 || rightPaddleCollision == 3) {
        //     this.setState((prevState) => ({
        //         ballDirectionX: -prevState.ballDirectionY,
        //     }));
        // }
        else if (newY + squareSize >= rect.bottom - rect.top || newY < 0) {
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
        else if (newX + squareSize >= rect.right - rect.left) {
            this.setState((prevState) => ({
                leftPlayerScore: prevState.leftPlayerScore + 1,
                ballX: 450, // change to be in the middle
                ballY: 300, // change to be in the middle
                ballDirectionY: Math.random() * 2 - 1,
                ballDirectionX: Math.random() * 2 - 1,
              }));
        }
        else {
            this.setState((prevState) => ({
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
