import React, { Component } from 'react';
import './css/GameBoard.css';
import axios from 'axios';
import { isNullOrUndefined } from 'util';

const io = require("socket.io-client");

const upArrow: number = 38;
const downArrow: number = 40;
const zKey: number = 90;
const sKey: number = 83;

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
    gameEnded: boolean;
    message: string;
}

class GameBoard extends Component<IProps, IState> {
    interval: NodeJS.Timer;
    rect: DOMRect | null;
    leftPaddleCollision: boolean;
    rightPaddleCollision: boolean;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    magicHeightRatio: number;
    magicWidthRatio: number;
    leftUser: string;
    rightUser: string;
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
            canvasContext: null,
            gameEnded: false,
            message: "",
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
        this.magicHeightRatio = this.rect!.height / 600;
        this.magicWidthRatio = this.rect!.width / 1000;
        let leftPaddle = document.querySelector('.leftPaddle') as HTMLElement
        let rightPaddle = document.querySelector('.rightPaddle') as HTMLElement
        leftPaddle.style.width = 20 / 1000 * this.rect!.width + "px";
        leftPaddle.style.height = 100 / 600 * this.rect!.height + "px";
        leftPaddle.style.marginLeft = 50 / 1000 * this.rect!.width + "px";
        rightPaddle.style.width = 20 / 1000 * this.rect!.width + "px";
        rightPaddle.style.height = 100 / 600 * this.rect!.height + "px";
        rightPaddle.style.marginRight = 50 / 1000 * this.rect!.width + "px";
        let ball = document.querySelector('.ball') as HTMLElement
        ball.style.width = 20 / 1000 * this.rect!.width + "px";
        ball.style.height = 20 / 600 * this.rect!.height + "px";
    }

    sleep(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    displayGame(data: any) {
        if (data.success == true)
            this.setState((prevState) => ({
                leftPaddleY: data.gameState.paddleLeft * this.magicHeightRatio,
                rightPaddleY: data.gameState.paddleRight * this.magicHeightRatio,
                ballX: data.gameState.x * this.magicWidthRatio,
                ballY: data.gameState.y * this.magicHeightRatio,
                leftPlayerScore: data.gameState.leftScore,
                rightPlayerScore: data.gameState.rightScore,
            }));
        let leftPaddle = document.querySelector('.leftPaddle') as HTMLElement
        let rightPaddle = document.querySelector('.rightPaddle') as HTMLElement
        leftPaddle.style.top = this.state.leftPaddleY + "px";
        rightPaddle.style.top = this.state.rightPaddleY + "px";
    }

    setSocket() {
        this.setState((prevState) => ({
            socket: io("http://localhost:3131/"),
        }));
        this.sleep(175).then(() => {
            this.state.socket.emit("connectGameClassic", {
                socketId: this.state.socket.id,
                login: sessionStorage.getItem("username"),
            });
            this.state.socket.on("gameState", (data: any) => {
                console.log("server response")
            });
            this.state.socket.on('update', (data: any) => {
                this.displayGame(data);
            });
            this.state.socket.on('usernames', (data: any) => {
                this.leftUser = data.leftUser;
                this.rightUser = data.rightUser;
            })
            this.state.socket.on('gameOver', (data: any) => {
                // window.location.href = "/profile";
                this.setState({ gameEnded: true, message: data.message });
                this.state.socket.off('update');
                this.state.socket.disconnect({ socketId: this.state.socket.id });
            })
            this.state.socket.emit("events", { socketId: this.state.socket.id, login: sessionStorage.getItem("username") });
            this.state.socket.emit("update", { socketId: this.state.socket.id });
            console.log("socketId", this.state.socket.id)
        });
    }

    async componentDidMount(): Promise<void> {
        this.setSocket();
        this.rect = document.querySelector('.gameBoard')!.getBoundingClientRect();
        this.magicHeightRatio = this.rect!.height / 600;
        this.magicWidthRatio = this.rect!.width / 1000;
        let leftPaddle = document.querySelector('.leftPaddle') as HTMLElement
        let rightPaddle = document.querySelector('.rightPaddle') as HTMLElement
        let middleBoard = document.querySelector('.middleBoard') as HTMLElement
        let points = document.querySelectorAll('.point') as NodeListOf<HTMLElement>
        leftPaddle.style.width = 20 / 1000 * this.rect!.width + "px";
        leftPaddle.style.height = 100 / 600 * this.rect!.height + "px";
        leftPaddle.style.marginLeft = 50 / 1000 * this.rect!.width + "px";
        rightPaddle.style.width = 20 / 1000 * this.rect!.width + "px";
        rightPaddle.style.height = 100 / 600 * this.rect!.height + "px";
        rightPaddle.style.marginRight = 50 / 1000 * this.rect!.width + "px";
        middleBoard.style.width = 3 / 1000 * this.rect!.width + "px";
        middleBoard.style.height = 600 / 600 * this.rect!.height + "px";
        points.forEach((point) => {
            point.style.width = 100 + "%";
            // point.style.height = 3 / 600 * this.rect!.height + "px";
            // point.style.marginBottom = (600 / 600 * this.rect!.height) / 12 + "px";
            point.style.height = 100 + "%";
            point.style.marginBottom = 100 / 11 + "px";
        })
        let ball = document.querySelector('.ball') as HTMLElement
        ball.style.width = 20 / 1000 * this.rect!.width + "px";
        ball.style.height = 20 / 600 * this.rect!.height + "px";
        window.addEventListener('resize', this.handleResize)

        document.addEventListener('keydown', (event) => {
            if (event.keyCode === upArrow)
                this.state.socket.emit("moveUp", { socketId: this.state.socket.id });
            else if (event.keyCode === downArrow)
                this.state.socket.emit("moveDown", { socketId: this.state.socket.id });
            else if (event.keyCode === zKey)
                this.state.socket.emit("moveUp", { socketId: this.state.socket.id });
            else if (event.keyCode === sKey)
                this.state.socket.emit("moveDown", { socketId: this.state.socket.id });
        }
        );
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.state.socket.emit("disconnect", { socketId: this.state.socket.id, username: sessionStorage.getItem("username") });
        this.state.socket.on('disconnect', () => {
            console.log('disconnected');
        });
        window.removeEventListener('resize', this.handleResize)
        window.removeEventListener('keydown', (event) => {
            if (event.keyCode === upArrow)
                this.state.socket.emit("moveUp", { socketId: this.state.socket.id });
            else if (event.keyCode === downArrow)
                this.state.socket.emit("moveDown", { socketId: this.state.socket.id });
            else if (event.keyCode === zKey)
                this.state.socket.emit("moveUp", { socketId: this.state.socket.id });
            else if (event.keyCode === sKey)
                this.state.socket.emit("moveDown", { socketId: this.state.socket.id });
        })
        // Needs to remove event listener 
    }

    render(): JSX.Element {
        return (
            this.state.gameEnded == false ? (
                <div className='gameboard-div'>
                    <p className="leftUser">{this.leftUser}</p>
                    <p className="rightUser">{this.rightUser}</p>
                    <div className="gameBoard">
                        <div className='middleBoard'>
                            <div className='point'></div>
                            <div className='point'></div>
                            <div className='point'></div>
                            <div className='point'></div>
                            <div className='point'></div>
                            <div className='point'></div>
                            <div className='point'></div>
                            <div className='point'></div>
                            <div className='point'></div>
                            <div className='point'></div>
                            <div className='point'></div>
                        </div>
                        <p className="leftScore">{this.state.leftPlayerScore}</p>
                        <p className="rightScore">{this.state.rightPlayerScore}</p>
                        <div className="leftPaddle" style={{ top: this.state.leftPaddleY }}></div>
                        <div className="ball" style={{ left: this.state.ballX, top: this.state.ballY }}></div>
                        <div className="rightPaddle" style={{ top: this.state.rightPaddleY }}></div>
                    </div>
                </div>
            ) :
                <>
                    <div className="gameOver">
                        <p className='game-over-p'>Game is over !</p>
                        <p className='state-message-p'>{this.state.message}</p>
                        <button className='go-back-button' onClick={() => window.location.href = "/profile"}>Back to profile</button>
                    </div>
                    <div className='gameboard-div' style={{ opacity: "0.3" }}>
                        <p className="leftUser">{this.leftUser}</p>
                        <p className="rightUser">{this.rightUser}</p>
                        <div className="gameBoard">
                            <div className='middleBoard'></div>
                            <p className="leftScore">{this.state.leftPlayerScore}</p>
                            <p className="rightScore">{this.state.rightPlayerScore}</p>
                            <div className="leftPaddle" style={{ top: this.state.leftPaddleY }}></div>
                            <div className="ball" style={{ left: this.state.ballX, top: this.state.ballY }}></div>
                            <div className="rightPaddle" style={{ top: this.state.rightPaddleY }}></div>
                        </div>
                    </div>
                </>
        );

    }
}

export default GameBoard;