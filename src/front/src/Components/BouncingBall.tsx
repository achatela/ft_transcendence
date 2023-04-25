import { Component } from 'react';
import './css/BouncingBall.css';

interface State {
  position: { x: number, y: number };
  direction: { dx: number, dy: number };
  start: number;
}

class BouncingBall extends Component<{speed: number, loginDiv: any}, State> {
  animationRef: number;
  lastFrameTime: number;
  speed: number;
  squareSize: number;
  intervalId: any;
  constructor(props: {speed: number, loginDiv: any}) {
    super(props);
    this.state = {
      start: 0,
      position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight},
      direction: { dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    };
    this.animationRef = 0;
    this.lastFrameTime = performance.now();
    this.speed = 3;
    this.squareSize = 40;
  }

  checkSpawn = (x: number, y: number, squareSize: number) => {
    if (x <= 12 + squareSize){
      return 1;
    }
    else if (x >= (window.innerWidth - (12 + (squareSize)))){
      return 1;
    }
    else if (y <= 12 + squareSize){
      return 1;
    }
    else if (y >= (window.innerHeight - (12 + (squareSize)))){
      return 1;
    }
    const loginDiv = document.querySelector('.login-div');
    const addDiv = document.querySelector('.addBallButton');
    const removeDiv = document.querySelector('.removeBallButton');
    // @ts-ignore: Object is possibly 'null'.
    const rect = loginDiv.getBoundingClientRect();
    // @ts-ignore: Object is possibly 'null'.
    const rectAdd = addDiv.getBoundingClientRect();
    // @ts-ignore: Object is possibly 'null'.
    const rectRemove = removeDiv.getBoundingClientRect();
    if ((x - squareSize <= rect.right && x + squareSize >= rect.left) && (y - squareSize <= rect.bottom && y + squareSize >= rect.top)){
      return 1;
    }
    else if ((x - squareSize <= rectAdd.right && x + squareSize >= rectAdd.left) && (y - squareSize <= rectAdd.bottom && y + squareSize >= rectAdd.top)){
      return 1;
    }
    else if ((x - squareSize <= rectRemove.right && x + squareSize >= rectRemove.left) && (y - squareSize <= rectRemove.bottom && y + squareSize >= rectRemove.top)){
      return 1;
    }
    return 0;
  };
  

  checkCollisionLogin = (newX: number, newY: number, squareSize: number, rect: {right: number, left: number, bottom: number, top: number}) => {
    return (
      newX < rect.right &&
      newX + squareSize > rect.left &&
      newY < rect.bottom &&
      newY + squareSize > rect.top
    );
  };

  checkCollisionAdd = (newX: number, newY: number, squareSize: number, rect: {right: number, left: number, bottom: number, top: number}) => {
    return (
      newX < rect.right &&
      newX + squareSize > rect.left &&
      newY < rect.bottom &&
      newY + squareSize > rect.top
    );
  };

  checkCollisionRemove = (newX: number, newY: number, squareSize: number, rect: {right: number, left: number, bottom: number, top: number}) => {
    return (
      newX < rect.right &&
      newX + squareSize > rect.left &&
      newY < rect.bottom &&
      newY + squareSize > rect.top
    );
  };

  updatePosition = () => {
    const { position, direction } = this.state;
    //const currentTime = performance.now();
    //const deltaTime = currentTime - this.lastFrameTime;
    //this.lastFrameTime = currentTime;
    
    const speedSlider = document.getElementById('myRange');
    const magnitude = Math.sqrt(direction.dx ** 2 + direction.dy ** 2);
    const normalisedSpeedX = direction.dx / magnitude;
    const normalisedSpeedY = direction.dy / magnitude;
    
    let newX: number = position.x;
    let newY: number = position.y;

    // @ts-ignore: Object is possibly 'null'.
    newX += (normalisedSpeedX * speedSlider.value) * this.speed;
    // @ts-ignore: Object is possibly 'null'.
    newY += (normalisedSpeedY * speedSlider.value) * this.speed;

    const loginDiv = document.querySelector('.login-div');
    const addedDiv = document.querySelector('.addBallButton');
    const removeDiv = document.querySelector('.removeBallButton');
    // @ts-ignore: Object is possibly 'null'.
    const rect = loginDiv.getBoundingClientRect();
    // @ts-ignore: Object is possibly 'null'.
    const rectAdd = addedDiv.getBoundingClientRect();
    // @ts-ignore: Object is possibly 'null'.
    const rectRemove = removeDiv.getBoundingClientRect();

    if (newX > window.innerWidth - (12 + this.squareSize)
        || newX < 12
        || this.checkCollisionLogin(newX, position.y, this.squareSize, rect)
        || this.checkCollisionAdd(newX, position.y, this.squareSize, rectAdd)
        || this.checkCollisionRemove(newX, position.y, this.squareSize, rectRemove))
    {
      this.setState((prevState) => ({
        direction: { ...prevState.direction, dx: -prevState.direction.dx },
      }));
    }
    else if (newY > window.innerHeight  - (12 + this.squareSize)
        || newY < 12 || this.checkCollisionLogin(position.x, newY, this.squareSize, rect)
        || this.checkCollisionAdd(position.x, newY, this.squareSize, rectAdd)
        || this.checkCollisionRemove(position.x, newY, this.squareSize, rectRemove))
    {
      this.setState((prevState) => ({
        direction: { ...prevState.direction, dy: -prevState.direction.dy },
      }));
    }
    else {
      this.setState({
        position: { x: newX, y: newY },
      });
    }

    this.animationRef = requestAnimationFrame(this.updatePosition);
  };

  componentDidMount() {
    let newPosition = this.state.position;
    // const loginDiv = document.getElementById('login-div-ref');
    // @ts-ignore: Object is possibly 'null'.
    // const rect = loginDiv.getBoundingClientRect();
    if (this.state.start === 0){
        while (this.checkSpawn(newPosition.x, newPosition.y, this.squareSize) === 1){
          newPosition = this.getRandomPosition();
        }
      this.setState({start: 1});
      this.setState({position: newPosition});
    }
    this.animationRef = requestAnimationFrame(this.updatePosition);
    this.intervalId = setInterval(() => {
      this.forceUpdate();
    }, 10);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationRef);
    clearInterval(this.intervalId);
  }

  getRandomPosition = () => {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    };
  };

  render() {
    return (
      <div className="bouncing-ball" style={{ left: this.state.position.x, top: this.state.position.y }}></div>
    );
  }
}

export default BouncingBall;