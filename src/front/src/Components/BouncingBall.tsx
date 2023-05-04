import { Component } from 'react';
import './css/BouncingBall.css';

interface State {
  position: { x: number, y: number };
  direction: { dx: number, dy: number };
  start: number;
  speedValue: number;
}

class BouncingBall extends Component<{speed: number, loginDiv: any}, State> {
  animationRef: number;
  lastFrameTime: number;
  speed: number;
  squareSize: number;
  intervalId: any;
  loginDiv: HTMLElement | null;
  addedDiv: HTMLElement | null;
  removeDiv: HTMLElement | null;
  magnitude: number;
  normalizedSpeedX: number;
  normalizedSpeedY: number;
  constructor(props: {speed: number, loginDiv: any}) {
    super(props);
    this.state = {
      start: 0,
      position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight},
      direction: { dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
      speedValue: 1,
    };
    this.animationRef = 0;
    this.lastFrameTime = performance.now();
    this.speed = 3;
    this.squareSize = 40;
    this.loginDiv = null;
    this.addedDiv = null;
    this.removeDiv = null;
    this.magnitude = Math.sqrt(this.state.direction.dx ** 2 + this.state.direction.dy ** 2);
    this.normalizedSpeedX = this.state.direction.dx / this.magnitude;
    this.normalizedSpeedY = this.state.direction.dy / this.magnitude;
  }

  handleSpeedChange = () => {
    const speedSlider = document.getElementById('myRange');
    // @ts-ignore: Object is possibly 'null'.
    this.setState({ speedValue: parseFloat(speedSlider.value) });
  };

  isValidSpawn = (x: number, y: number, squareSize: number) => {
    // Check if the position is within the bounds of the window
    if (
      x <= 12 + squareSize ||
      x >= window.innerWidth - (12 + squareSize) ||
      y <= 12 + squareSize ||
      y >= window.innerHeight - (12 + squareSize)
    ) {
      return false;
    }
  
    const elements = [
      document.querySelector(".login-div"),
      document.querySelector(".addBallButton"),
      document.querySelector(".removeBallButton"),
    ];
  
    // Check if the position overlaps with any of the elements
    for (const element of elements) {
      if (element) {
        const rect = element.getBoundingClientRect();
        if (
          x - squareSize <= rect.right &&
          x + squareSize >= rect.left &&
          y - squareSize <= rect.bottom &&
          y + squareSize >= rect.top
        ) {
          return false;
        }
      }
    }
  
    // If the position is valid, return true
    return true;
  };  

  checkCollisions = (newX: number, newY: number, squareSize: number, elements: HTMLElement[]) => {
    for (const element of elements) {
      if (this.checkCollision(newX, newY, squareSize, element)) {
        return true;
      }
    }
    return false;
  };

  checkCollision = (newX: number, newY: number, squareSize: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return (
      newX < rect.right &&
      newX + squareSize > rect.left &&
      newY < rect.bottom &&
      newY + squareSize > rect.top
    );
  };

  updatePosition = () => {
    const { position, direction, speedValue } = this.state;

    // const magnitude = Math.sqrt(direction.dx ** 2 + direction.dy ** 2);
    // const normalisedSpeedX = direction.dx / magnitude;
    // const normalisedSpeedY = direction.dy / magnitude;
  
    let newX: number = position.x;
    let newY: number = position.y;
  
    newX += this.normalizedSpeedX * speedValue * this.speed;
    newY += this.normalizedSpeedY * speedValue * this.speed;
  
    // Use the stored element references
    // @ts-ignore: Object is possibly 'null'.
    const elements = [this.loginDiv, this.addedDiv, this.removeDiv].filter(el => el !== null) as HTMLElement[];
  
    if (newX > window.innerWidth - (12 + this.squareSize)
      || newX < 12
      || this.checkCollisions(newX, position.y, this.squareSize, elements)) {
      this.setState((prevState) => ({
        direction: { ...prevState.direction, dx: -prevState.direction.dx },
      }));
      this.magnitude = Math.sqrt(this.state.direction.dx ** 2 + this.state.direction.dy ** 2);
      this.normalizedSpeedX = this.state.direction.dx / this.magnitude;
    }
    else if (newY > window.innerHeight - (12 + this.squareSize)
      || newY < 12 || this.checkCollisions(position.x, newY, this.squareSize, elements)) {
      this.setState((prevState) => ({
        direction: { ...prevState.direction, dy: -prevState.direction.dy },
      }));
      this.magnitude = Math.sqrt(this.state.direction.dx ** 2 + this.state.direction.dy ** 2);
      this.normalizedSpeedY = this.state.direction.dy / this.magnitude;
    }
    else {
      this.setState({
        position: { x: newX, y: newY },
      });
    }
    this.animationRef = requestAnimationFrame(this.updatePosition);
  };

  handleResize = () => {
    let newPosition = this.state.position;
    newPosition = this.getRandomPosition();
    while (this.isValidSpawn(newPosition.x, newPosition.y, this.squareSize) === false){
      newPosition = this.getRandomPosition();
    }
    this.setState({position: newPosition});
  };

  componentDidMount() {
    let newPosition = this.state.position;
    const speedSlider = document.getElementById('myRange');

    window.addEventListener("resize", this.handleResize);
    // @ts-ignore: Object is possibly 'null'.
    if (this.state.start === 0) {
      while (this.isValidSpawn(newPosition.x, newPosition.y, this.squareSize) === false) {
        newPosition = this.getRandomPosition();
      }
      this.setState({ start: 1 });
      this.setState({ position: newPosition });
    }
    this.animationRef = requestAnimationFrame(this.updatePosition);
    this.intervalId = setInterval(() => {
    }, 10);
    this.loginDiv = document.querySelector('.login-div');
    this.addedDiv = document.querySelector('.addBallButton');
    this.removeDiv = document.querySelector('.removeBallButton');
    // @ts-ignore: Object is possibly 'null'.
    speedSlider.addEventListener('input', this.handleSpeedChange);
    this.handleSpeedChange();
  }
  
  componentWillUnmount() {
    const speedSlider = document.getElementById('myRange');
    cancelAnimationFrame(this.animationRef);
    clearInterval(this.intervalId);
    // @ts-ignore: Object is possibly 'null'.
    speedSlider.removeEventListener('input', this.handleSpeedChange);
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
  