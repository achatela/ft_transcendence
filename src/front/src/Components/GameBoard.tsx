import React, { Component } from 'react';
import './css/GameBoard.css';
import axios from 'axios';
import { isNullOrUndefined } from 'util';

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

const io = require("socket.io-client");

const upArrow: number = 38;
const downArrow: number = 40;
const zKey: number = 87;
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
    secondLeftPaddleY: number;
    secondRightPaddleY: number;
    canvasContext: CanvasRenderingContext2D | null;
    socket: any;
    gameEnded: boolean;
    message: string;
    disconnectMessage: string;
    displayDisconnectMessage: boolean;
    secondsLeft: number;
}

class GameBoard extends Component<IProps, IState> {
    interval: NodeJS.Timer | null;
    interval2: NodeJS.Timer | null;
    rect: DOMRect | null;
    leftPaddleCollision: boolean;
    rightPaddleCollision: boolean;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    magicHeightRatio: number;
    magicWidthRatio: number;
    leftUser: string;
    rightUser: string;
    username: string;
    timeout: NodeJS.Timeout | null;
    constructor(props: IProps) {
        super(props);
        const dirX = Math.random() < 0.5 ? -1 : 1;
        const dirY = Math.random() * 2 - 1;
        const magnitude = Math.sqrt(dirX ** 2) + Math.sqrt(dirY ** 2);
        this.state = {
            socket: null,
            leftPaddleY: 0,
            rightPaddleY: 0,
            secondLeftPaddleY: -1,
            secondRightPaddleY: -1,
            ballDirectionX: dirX / magnitude,
            ballDirectionY: dirY / magnitude,
            leftPlayerScore: 0,
            rightPlayerScore: 0,
            ballX: 0,
            ballY: 0,
            canvasContext: null,
            gameEnded: false,
            message: "",
            displayDisconnectMessage: false,
            disconnectMessage: "Opponent disconnected, redirecting to profile in",
            secondsLeft: 10,
        };
        this.interval = null;
        this.rect = null;
        this.leftPaddleCollision = false;
        this.rightPaddleCollision = false;
        this.canvasRef = React.createRef();
        this.handleResize = this.handleResize.bind(this);
        this.username = sessionStorage.getItem('username')!;
        this.timeout = null;
        this.interval2 = null;
    }

    handleResize() {
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
        if (data.success == true) {
            if (sessionStorage.getItem('gameMode') === ('classic'))
                this.setState((prevState) => ({
                    leftPaddleY: data.gameState.paddleLeft * this.magicHeightRatio,
                    rightPaddleY: data.gameState.paddleRight * this.magicHeightRatio,
                    ballX: data.gameState.x * this.magicWidthRatio,
                    ballY: data.gameState.y * this.magicHeightRatio,
                    leftPlayerScore: data.gameState.leftScore,
                    rightPlayerScore: data.gameState.rightScore,
                }));
            else if (sessionStorage.getItem('gameMode') === ('custom')) {
                this.setState((prevState) => ({
                    leftPaddleY: data.gameState.paddleLeft * this.magicHeightRatio,
                    rightPaddleY: data.gameState.paddleRight * this.magicHeightRatio,
                    secondLeftPaddleY: data.gameState.secondPaddleLeft * this.magicHeightRatio,
                    secondRightPaddleY: data.gameState.secondPaddleRight * this.magicHeightRatio,
                    ballX: data.gameState.x * this.magicWidthRatio,
                    ballY: data.gameState.y * this.magicHeightRatio,
                    leftPlayerScore: data.gameState.leftScore,
                    rightPlayerScore: data.gameState.rightScore,
                }));

                let secondLeftPaddle = document.querySelectorAll('.leftPaddle')[1] as HTMLElement
                let secondRightPaddle = document.querySelectorAll('.rightPaddle')[1] as HTMLElement

                if (secondLeftPaddle)
                    secondLeftPaddle!.style!.width = 20 / 1000 * this.rect!.width + "px";
                if (secondLeftPaddle)
                    secondLeftPaddle!.style.height = 100 / 600 * this.rect!.height + "px";
                if (secondLeftPaddle)
                    secondLeftPaddle!.style.marginLeft = 275 / 1000 * this.rect!.width + "px";
                if (secondRightPaddle)
                    secondRightPaddle!.style.width = 20 / 1000 * this.rect!.width + "px";
                if (secondRightPaddle)
                    secondRightPaddle!.style.height = 100 / 600 * this.rect!.height + "px";
                if (secondRightPaddle)
                    secondRightPaddle!.style.marginRight = 275 / 1000 * this.rect!.width + "px";
            }
        }
        let leftPaddle = document.querySelectorAll('.leftPaddle')[0] as HTMLElement
        let rightPaddle = document.querySelectorAll('.rightPaddle')[0] as HTMLElement
        leftPaddle.style.top = this.state.leftPaddleY + "px";
        rightPaddle.style.top = this.state.rightPaddleY + "px";
    }

    async update(keysPressed: any) {
        if (this.leftUser == this.username) {
            if (keysPressed[upArrow] && keysPressed[zKey]) {
                this.state.socket.emit("moveUp", { key: "Z" });
                this.state.socket.emit("moveUp", { key: "up" });
            }
            else if (keysPressed[downArrow] && keysPressed[zKey]) {
                this.state.socket.emit("moveDown", { key: "S" });
                this.state.socket.emit("moveUp", { key: "up" });
            }
            else if (keysPressed[upArrow] && keysPressed[sKey]) {
                this.state.socket.emit("moveUp", { key: "Z" });
                this.state.socket.emit("moveDown", { key: "down" });
            }
            else if (keysPressed[downArrow] && keysPressed[sKey]) {
                this.state.socket.emit("moveDown", { key: "S" });
                this.state.socket.emit("moveDown", { key: "down" });
            }
            else if (keysPressed[upArrow])
                this.state.socket.emit("moveUp", { key: "Z" });
            else if (keysPressed[downArrow])
                this.state.socket.emit("moveDown", { key: "S" });
            else if (keysPressed[zKey])
                this.state.socket.emit("moveUp", { key: "up" });
            else if (keysPressed[sKey])
                this.state.socket.emit("moveDown", { key: "down" });
        }
        else if (this.rightUser == this.username) {
            if (keysPressed[upArrow] && keysPressed[zKey]) {
                this.state.socket.emit("moveUp", { key: "up" });
                this.state.socket.emit("moveUp", { key: "Z" });
            }
            else if (keysPressed[downArrow] && keysPressed[zKey]) {
                this.state.socket.emit("moveDown", { key: "down" });
                this.state.socket.emit("moveUp", { key: "Z" });
            }
            else if (keysPressed[upArrow] && keysPressed[sKey]) {
                this.state.socket.emit("moveUp", { key: "up" });
                this.state.socket.emit("moveDown", { key: "S" });
            }
            else if (keysPressed[downArrow] && keysPressed[sKey]) {
                this.state.socket.emit("moveDown", { key: "down" });
                this.state.socket.emit("moveDown", { key: "S" });
            }
            else if (keysPressed[upArrow])
                this.state.socket.emit("moveUp", { key: "up" });
            else if (keysPressed[downArrow])
                this.state.socket.emit("moveDown", { key: "down" });
            else if (keysPressed[zKey])
                this.state.socket.emit("moveUp", { key: "Z" });
            else if (keysPressed[sKey])
                this.state.socket.emit("moveDown", { key: "S" });
        }
    }

    async setEvents() {
        const keysPressed: { [key: number]: boolean } = {};
        if (this.leftUser == sessionStorage.getItem('username')) {
            document.addEventListener('keydown', (event) => {
                keysPressed[event.keyCode] = true;
            });
        }
        else if (this.rightUser == sessionStorage.getItem('username')) {
            document.addEventListener('keydown', (event) => {
                keysPressed[event.keyCode] = true;
            });
        }
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.keyCode];
        });

        console.log("events emitted")
        this.timeout = setTimeout(() => {
            this.interval2 = setInterval(() => {
                this.update(keysPressed);
            }, 55);
        }, 10);
    }

    setSocket() {
        this.setState((prevState) => ({
            socket: io("http://" + domain + ":3333/"),
        }));
        this.sleep(175).then(() => {
            if (sessionStorage.getItem('gameMode') === "classic") {
                this.state.socket.emit("connectGameClassic", {
                    socketId: this.state.socket.id,
                    login: sessionStorage.getItem("username"),
                });
            }
            else if (sessionStorage.getItem('gameMode') === "custom") {
                this.state.socket.emit("connectGameCustom", {
                    socketId: this.state.socket.id,
                    login: sessionStorage.getItem("username"),
                });
            }
            this.state.socket.on("gameState", (data: any) => {
                console.log("server response")
            });
            this.state.socket.on('update', (data: any) => {
                this.displayGame(data);
            });
            this.state.socket.on('usernames', (data: any) => {
                this.leftUser = data.leftUser;
                this.rightUser = data.rightUser;
                if (this.interval2 === null && this.timeout === null)
                    this.setEvents();
            })
            this.state.socket.on('gameOver', (data: any) => {
                // window.location.href = "/profile";
                this.setState({ gameEnded: true, message: data.message });
                this.state.socket.off('update');
                this.state.socket.disconnect({ socketId: this.state.socket.id });
            })
            this.state.socket.on('opponentDisconnected', (data: any) => {
                this.setState({ displayDisconnectMessage: true, secondsLeft: 10 });
                this.interval = setInterval(() => {
                    this.setState((prevState) => ({
                        secondsLeft: prevState.secondsLeft - 1,
                    }))
                }, 975);
                this.sleep(10000).then(() => {
                    if (this.state.secondsLeft <= 0)
                        window.location.href = "/profile";
                })
            })
            this.state.socket.on('opponentReconnected', (data: any) => {
                this.setState({ displayDisconnectMessage: false });
                clearInterval(this.interval);
                // this.state.socket.emit("update", { socketId: this.state.socket.id });
            })
            this.state.socket.emit("events", { socketId: this.state.socket.id, login: sessionStorage.getItem("username") });
            this.state.socket.emit("update", { socketId: this.state.socket.id, username: sessionStorage.getItem("username") });
            console.log("socketId", this.state.socket.id)
        });
    }

    async componentDidMount(): Promise<void> {
        try {
            const request = await axios.post('http://' + domain + ':3333/pong/user_ingame/',
                JSON.stringify({
                    username: sessionStorage.getItem('username'),
                    accessToken: sessionStorage.getItem("accessToken"),
                    refreshToken: sessionStorage.getItem("refreshToken")
                }),
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (request.data.success == true) {
                sessionStorage.setItem("accessToken", request.data.accessToken);
                sessionStorage.setItem("refreshToken", request.data.refreshToken);
                if (request.data.inGame == false)
                    window.location.href = "/mode";
            }
            else {
                console.error(request.data.message)
            }
        }
        catch (err) {
            console.log(err);
        }
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
            point.style.height = 100 + "%";
            point.style.marginBottom = 100 / 11 + "px";
        })
        let ball = document.querySelector('.ball') as HTMLElement
        ball.style.width = 20 / 1000 * this.rect!.width + "px";
        ball.style.height = 20 / 600 * this.rect!.height + "px";
        window.addEventListener('resize', this.handleResize)
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.state.socket.emit("disconnect", { socketId: this.state.socket.id, username: sessionStorage.getItem("username") });
        this.state.socket.on('disconnect', () => {
            console.log('disconnected');
        });
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('keydown', () => { });
        window.removeEventListener('keyup', () => { });
    }

    render(): JSX.Element {
        return (
            this.state.gameEnded == false ? (
                < div className='gameboard-div' >
                    {this.state.displayDisconnectMessage == true ?
                        <p className='reconnect-message'>
                            {this.state.disconnectMessage} {this.state.secondsLeft}
                        </p>
                        :
                        null
                    }
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
                        {this.state.secondLeftPaddleY != -1 ? <div className="leftPaddle" style={{ top: this.state.secondLeftPaddleY }}></div> : null}
                        <div className="ball" style={{ left: this.state.ballX, top: this.state.ballY }}></div>
                        <div className="rightPaddle" style={{ top: this.state.rightPaddleY }}></div>
                        {this.state.secondRightPaddleY != -1 ? <div className="rightPaddle" style={{ top: this.state.secondRightPaddleY }}></div> : null}
                    </div>
                </div >
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
                            {this.state.secondLeftPaddleY != -1 ? <div className="leftPaddle" style={{ top: this.state.secondLeftPaddleY }}></div> : null}
                            <div className="ball" style={{ left: this.state.ballX, top: this.state.ballY }}></div>
                            <div className="rightPaddle" style={{ top: this.state.rightPaddleY }}></div>
                            {this.state.secondRightPaddleY != -1 ? <div className="rightPaddle" style={{ top: this.state.secondRightPaddleY }}></div> : null}
                        </div>
                    </div>
                </>
        );

    }
}

export default GameBoard;