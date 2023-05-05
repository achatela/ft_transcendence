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
    magnitude: number;
    normalizedSpeedX: number;
    normalizedSpeedY: number;
    rect: DOMRect | null;
    constructor(props: IProps) {
        super(props);
        this.state = {
            leftPaddleY: 400,
            rightPaddleY: 100,
            ballDirectionX: Math.random() * 2 - 1,
            ballDirectionY: Math.random() * 2 - 1,
            leftPlayerScore: 0,
            rightPlayerScore: 0,
            ballX: 0,
            ballY: 0,
        };
        this.interval = setInterval(() => {}, 10);
        this.magnitude = Math.sqrt(this.state.ballDirectionX ** 2 + this.state.ballDirectionY ** 2);
        this.normalizedSpeedX = this.state.ballDirectionX / this.magnitude;
        this.normalizedSpeedY = this.state.ballDirectionY / this.magnitude;
        this.rect = null;
    }

    handleResize() {
        console.log("resize")
        this.rect = document.querySelector('.gameBoard')!.getBoundingClientRect();
    }

    componentDidMount() {
        // @ts-ignore: Object is possibly 'null'.
        this.rect = document.querySelector('.gameBoard').getBoundingClientRect();
        // @ts-ignore: Object is possibly 'null'.
        let bottomBorder = this.rect.bottom - this.rect.top;

        window.addEventListener('resize', this.handleResize)
 
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
        this.setState((prevState) => ({
            ballX: this.rect!.width / 2 - (squareSize / 2),
            ballY: this.rect!.height / 2 - (squareSize / 2),
        }));
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        // Needs to remove event listener
    }

    checkPaddleCollision(ballX: number, ballY: number, paddleX: number, paddleY: number, paddleWidth: number, paddleHeight: number) {
        const ballCenterX = ballX + squareSize / 2;
        const ballCenterY = ballY + squareSize / 2;
        const paddleCenterX = paddleX + paddleWidth / 2;
        const paddleCenterY = paddleY + paddleHeight / 2;
      
        const distanceX = Math.abs(ballCenterX - paddleCenterX);
        const distanceY = Math.abs(ballCenterY - paddleCenterY);
      
        const combinedHalfWidths = (squareSize + paddleWidth) / 2;
        const combinedHalfHeights = (squareSize + paddleHeight) / 2;
      
        if (distanceX < combinedHalfWidths && distanceY < combinedHalfHeights) {
          const overlapX = combinedHalfWidths - distanceX;
          const overlapY = combinedHalfHeights - distanceY;
      
          if (overlapX < overlapY) {
            // Horizontal collision
            if (this.state.ballDirectionX < 0)
                this.setState(prevState => ({
                    ballX: prevState.ballX + overlapX,
                    }));
            else
                this.setState(prevState => ({
                    ballX: prevState.ballX - overlapX,
                }));
            return 1;
          } else {
            // Vertical collision
            if (this.state.ballDirectionX < 0)
                this.setState(prevState => ({
                    ballX: prevState.ballX + overlapX,
                }));
            else
                this.setState(prevState => ({
                    ballX: prevState.ballX - overlapX,
                }));
            return 2;
          }
        }
        return 0;
      }      

    renderBall = () => {
        const newX = this.state.ballX + (this.normalizedSpeedX * 3);
        const newY = this.state.ballY + (this.normalizedSpeedY * 3);
        // Handle collisions with the left Paddle

        const leftPaddleCollision = this.checkPaddleCollision(newX, newY, 50, this.state.leftPaddleY, paddleWidth, paddleHeight);
        // @ts-ignore: Object is possibly 'null'.
        const rightPaddleCollision = this.checkPaddleCollision(newX, newY, this.rect.right - this.rect.left - 50 - paddleWidth, this.state.rightPaddleY, paddleWidth, paddleHeight);

        // const leftPaddleCollision = this.checkPaddleCollision(newX, newY, 50 + paddleWidth, 50, this.state.leftPaddleY - squareSize, this.state.leftPaddleY + paddleHeight)
        // const rightPaddleCollision = this.checkPaddleCollision(newX, newY, this.rect.right - this.rect.left - 50 - squareSize, this.rect.right - this.rect.left - 50 - squareSize - paddleWidth, this.state.rightPaddleY - squareSize, this.state.rightPaddleY + paddleHeight)

        if (leftPaddleCollision == 1 || rightPaddleCollision == 1) {
            this.setState((prevState) => ({
                ballDirectionX: -prevState.ballDirectionX,
            }));
            this.magnitude = Math.sqrt(this.state.ballDirectionX ** 2 + this.state.ballDirectionY ** 2);
            this.normalizedSpeedX = this.state.ballDirectionX / this.magnitude;
        }
        else if (leftPaddleCollision == 2 || rightPaddleCollision == 2) {
            this.setState((prevState) => ({
                ballDirectionY: -prevState.ballDirectionY,
            }));
            this.magnitude = Math.sqrt(this.state.ballDirectionX ** 2 + this.state.ballDirectionY ** 2);
            this.normalizedSpeedY = this.state.ballDirectionY / this.magnitude;
        }
        // else if (leftPaddleCollision == 3 || rightPaddleCollision == 3) {
        //     this.setState((prevState) => ({
        //         ballDirectionX: -prevState.ballDirectionY,
        //     }));
        // }
        // @ts-ignore: Object is possibly 'null'.
        else if (newY + squareSize >= this.rect.bottom - this.rect.top || newY < 0) {
            this.setState((prevState) => ({
                ballDirectionY: -prevState.ballDirectionY,
            }));
            this.magnitude = Math.sqrt(this.state.ballDirectionX ** 2 + this.state.ballDirectionY ** 2);
            this.normalizedSpeedY = this.state.ballDirectionY / this.magnitude;
        }
        else if (newX < 0) {
            this.setState((prevState) => ({
                rightPlayerScore: prevState.rightPlayerScore + 1,
                ballX: this.rect!.width / 2 - (squareSize / 2), // change to be in the middle
                ballY: this.rect!.height / 2 - (squareSize / 2), // change to be in the middle
                ballDirectionY: Math.random() * 2 - 1,
                ballDirectionX: Math.random() * 2 - 1,
              }));
            this.magnitude = Math.sqrt(this.state.ballDirectionX ** 2 + this.state.ballDirectionY ** 2);
            this.normalizedSpeedX = this.state.ballDirectionX / this.magnitude;
            this.normalizedSpeedY = this.state.ballDirectionY / this.magnitude;
        }
        // @ts-ignore: Object is possibly 'null'.
        else if (newX + squareSize >= this.rect.right - this.rect.left) {
            this.setState((prevState) => ({
                leftPlayerScore: prevState.leftPlayerScore + 1,
                ballX: this.rect!.width / 2 - (squareSize / 2), // change to be in the middle
                ballY: this.rect!.height / 2 - (squareSize / 2), // change to be in the middle
                ballDirectionY: Math.random() * 2 - 1,
                ballDirectionX: Math.random() * 2 - 1,
              }));
              this.magnitude = Math.sqrt(this.state.ballDirectionX ** 2 + this.state.ballDirectionY ** 2);
              this.normalizedSpeedX = this.state.ballDirectionX / this.magnitude;
              this.normalizedSpeedY = this.state.ballDirectionY / this.magnitude;
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
