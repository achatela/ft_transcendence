import React, { Component } from 'react';
import './css/GameBoard.css';
import axios from 'axios';

const io = require("socket.io-client");

const upArrow: number = 38;
const downArrow: number = 40;
const zKey: number = 90;
const sKey: number = 83;
const speedMultiplier: number = 8;
const paddleStep: number = 25;
const paddleHeight: number = 100;
const paddleMid: number = paddleHeight / 2;
const paddleGap: number = 50;
const paddleWidth: number = 20;
const squareSize: number = 20;
const midSquare: number = squareSize / 2;

interface IProps { }

interface IState {
    ballX: number;
    ballY: number;
    ballDirectionX: number;
    ballDirectionY: number;
    leftPlayerScore: number;
    rightPlayerScore: number;
    leftPaddleY: number;
    rightPaddleY: number;
    canvasContext: CanvasRenderingContext2D | null;
    socket: any;
}

class GameBoard extends Component<IProps, IState> {
    interval: NodeJS.Timer;
    rect: DOMRect | null;
    leftPaddleCollision: boolean;
    rightPaddleCollision: boolean;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    constructor(props: IProps) {
        super(props);
        const dirX = Math.random() < 0.5 ? -1 : 1;
        const dirY = Math.random() * 2 - 1;
        const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
        this.state = {
            socket: null,
            leftPaddleY: 0,
            rightPaddleY: 0,
            ballDirectionX: dirX / magnitude,
            ballDirectionY: dirY / magnitude,
            leftPlayerScore: 0,
            rightPlayerScore: 0,
            ballX: 0,
            ballY: 0,
            canvasContext: null
        };
        this.interval = setInterval(() => { }, 10);
        this.rect = null;
        this.leftPaddleCollision = false;
        this.rightPaddleCollision = false;
        this.canvasRef = React.createRef();
    }

    handleResize() {
        console.log("resize")
        this.rect = document.querySelector('.gameBoard')!.getBoundingClientRect();
    }

    sleep(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    async setSocket() {
        await this.setState((prevState) => ({
            socket: io("http://localhost:3131/"),
        }));
        this.sleep(75).then(() => {
            this.state.socket.emit("connectGameClassic", {
                socketId: this.state.socket.id,
                login: sessionStorage.getItem("login"),
            });
            this.state.socket.on("gameState", (data: any) => {
                console.log("server response")
            });
            this.state.socket.on('update', (data: any) => {
                console.log(data);
            });
            this.state.socket.emit("events", { socketId: this.state.socket.id, login: sessionStorage.getItem("login") });
            this.state.socket.emit("update", { socketId: this.state.socket.id });
            console.log("socketId", this.state.socket.id)
        });
    }

    async componentDidMount(): Promise<void> {
        this.setSocket();
        this.rect = document.querySelector('.gameBoard')!.getBoundingClientRect();
        let bottomBorder = this.rect.bottom - this.rect.top;
        this.setState((prevState) => ({
            leftPaddleY: bottomBorder / 2 - paddleMid,
            rightPaddleY: bottomBorder / 2 - paddleMid
        }));

        window.addEventListener('resize', this.handleResize)

        this.interval = setInterval(this.renderBall, 10);
        document.addEventListener('keydown', (event) => {
            if (event.keyCode === upArrow) {
                this.state.socket.emit("moveUp", { socketId: this.state.socket.id });
                if (this.state.rightPaddleY < paddleStep) {
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
                this.state.socket.emit("moveDown", { socketId: this.state.socket.id });
                if (this.state.rightPaddleY + paddleHeight + paddleStep > bottomBorder)
                    this.setState((prevState) => ({
                        rightPaddleY: bottomBorder - paddleHeight - 4,
                    }));
                else
                    this.setState((prevState) => ({
                        rightPaddleY: prevState.rightPaddleY + paddleStep,
                    }));
            }
            else if (event.keyCode === zKey) {
                this.state.socket.emit("moveUp", { socketId: this.state.socket.id });
                if (this.state.leftPaddleY < paddleStep) {
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
            else if (event.keyCode === sKey) {
                this.state.socket.emit("moveDown", { socketId: this.state.socket.id });
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
            canvasContext: this.canvasRef.current?.getContext('2d')
        }));
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.state.socket.on('disconnect', () => {
            console.log('disconnected');
        }
        );
        window.removeEventListener('resize', this.handleResize)
        // Needs to remove event listener
    }


    checkPaddleCollision(ballX: number, ballY: number, paddleX: number, paddleY: number) {
        const ballLeft = ballX;
        const ballRight = ballX + squareSize;
        const ballTop = ballY;
        const ballBottom = ballY + squareSize;

        const paddleLeft = paddleX;
        const paddleRight = paddleX + paddleWidth;
        const paddleTop = paddleY;
        const paddleBottom = paddleY + paddleHeight;

        // Check if ball and paddle are colliding
        if (ballRight > paddleLeft && ballLeft < paddleRight && ballBottom > paddleTop && ballTop < paddleBottom) {
            return true;
        }
        return false;
    }

    // componentDidUnmount() {
    //     clearInterval(this.interval);
    //     this.state.socket.on('disconnect', () => {
    //         console.log('disconnected');
    //     }
    //     );
    // }



    renderBall = () => {
        const newX = this.state.ballX + this.state.ballDirectionX * speedMultiplier;
        const newY = this.state.ballY + this.state.ballDirectionY * speedMultiplier;
        const lpc = this.checkPaddleCollision(newX, newY, paddleGap, this.state.leftPaddleY);
        const rpc = this.checkPaddleCollision(newX, newY, this.rect!.right - this.rect!.left - paddleGap - paddleWidth, this.state.rightPaddleY);
        if (lpc == true && this.leftPaddleCollision == false) {
            const dirX = -this.state.ballDirectionX;
            const dirY = (this.state.ballY + squareSize / 2 - this.state.leftPaddleY - paddleMid) / paddleMid;
            const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
            this.setState((prevState) => ({
                ballDirectionX: dirX / magnitude,
                ballDirectionY: dirY / magnitude
            }));
        }
        else if (rpc == true && this.rightPaddleCollision == false) {
            const dirX = -this.state.ballDirectionX;
            const dirY = (this.state.ballY + squareSize / 2 - this.state.rightPaddleY - paddleMid) / paddleMid;
            const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
            this.setState((prevState) => ({
                ballDirectionX: dirX / magnitude,
                ballDirectionY: dirY / magnitude
            }));
        }
        else if (newY < 0 || newY + squareSize > this.rect!.bottom - this.rect!.top) {
            this.setState((prevState) => ({
                ballDirectionY: -prevState.ballDirectionY
            }));
        }
        else if (newX < 0) {
            const dirX = Math.random() * 2 - 1;
            const dirY = Math.random() * 2 - 1;
            const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
            this.setState((prevState) => ({
                rightPlayerScore: prevState.rightPlayerScore + 1,
                ballX: this.rect!.width / 2 - (squareSize / 2), // change to be in the middle
                ballY: this.rect!.height / 2 - (squareSize / 2), // change to be in the middle
                ballDirectionX: dirX / magnitude,
                ballDirectionY: dirY / magnitude
            }));
        }
        else if (newX + squareSize > this.rect!.right - this.rect!.left) {
            const dirX = Math.random() * 2 - 1;
            const dirY = Math.random() * 2 - 1;
            const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
            this.setState((prevState) => ({
                leftPlayerScore: prevState.leftPlayerScore + 1,
                ballX: this.rect!.width / 2 - (squareSize / 2), // change to be in the middle
                ballY: this.rect!.height / 2 - (squareSize / 2), // change to be in the middle
                ballDirectionX: dirX / magnitude,
                ballDirectionY: dirY / magnitude
            }));
        }
        else {
            const ctx = this.state.canvasContext;
            if (ctx) {
                ctx.clearRect(0, 0, this.rect!.width, this.rect!.height);
                ctx.fillStyle = 'white';
                ctx.fillRect(paddleGap, this.state.leftPaddleY, paddleWidth, paddleHeight);
                ctx.fillRect(this.rect!.right - this.rect!.left - paddleGap - paddleWidth, this.state.rightPaddleY, paddleWidth, paddleHeight);
                ctx.fillRect(newX, newY, squareSize, squareSize);
            }
            this.setState((prevState) => ({
                ballX: newX,
                ballY: newY
            }));
        }
        this.leftPaddleCollision = lpc;
        this.rightPaddleCollision = rpc;
    };

    render(): JSX.Element {
        return (
            <div className="gameBoard">
                <p className="leftScore">{this.state.leftPlayerScore}</p>
                <p className="rightScore">{this.state.rightPlayerScore}</p>
                <canvas ref={this.canvasRef} width={this.rect?.width} height={this.rect?.height} />
            </div>
        );
    }
}

export default GameBoard;