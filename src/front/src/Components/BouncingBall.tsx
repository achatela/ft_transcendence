import { Component, Dispatch, SetStateAction} from 'react';
import './css/BouncingBall.css';

interface State {
  position: { x: number, y: number };
  direction: { dx: number, dy: number };
  speed: number;
  start: number;
}

class BouncingBall extends Component<{index: number, speed: number, balls: any[]}, State> {
  animationRef: number;
  lastFrameTime: number;
  speedMultiplier: number;
  squareSize: number;
  intervalId: any;
  magnitude: number;
  normalizedSpeedX: number;
  normalizedSpeedY: number;
  elements: Array<any>;
  constructor(props: {index: number, speed: number, balls: any[]}) {
    super(props);
    this.state = {
      position: props.balls[props.index].position,
      direction: props.balls[props.index].direction,
      speed: props.speed,
      start: 0
    };
    this.animationRef = 0;
    this.lastFrameTime = performance.now();
    this.speedMultiplier = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 700;
    this.squareSize = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 100;
    this.magnitude = Math.sqrt(this.state.direction.dx ** 2 + this.state.direction.dy ** 2);
    this.normalizedSpeedX = this.state.direction.dx / this.magnitude;
    this.normalizedSpeedY = this.state.direction.dy / this.magnitude;
    this.elements = Array<any>(null);
  }

  updateBall = (ball: {position: {x: number, y: number}, direction: {dx: number, dy: number}}) => {
    const balls = JSON.parse(sessionStorage.getItem('balls'));
    balls[this.props.index] = ball;
    // this.props.setBalls(balls)
    sessionStorage.setItem('balls', JSON.stringify(balls));
    this.setState({position: ball.position, direction: ball.direction})
  }

  handleSpeedChange = () => {
    const speedSlider = document.getElementById('myRange');
    // @ts-ignore: Object is possibly 'null'.
    this.setState({ speed: parseFloat(speedSlider.value) });
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

    // Check if the position overlaps with any of the elements
    for (const element of this.elements) {
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
    const rect = element?.getBoundingClientRect();
    return (
      newX < rect?.right &&
      newX + squareSize > rect?.left &&
      newY < rect?.bottom &&
      newY + squareSize > rect?.top
    );
  };

  updatePosition = () => {
    let newX: number = this.state.position.x;
    let newY: number = this.state.position.y;

    newX += this.normalizedSpeedX * this.state.speed * this.speedMultiplier;
    newY += this.normalizedSpeedY * this.state.speed * this.speedMultiplier;

    if (newX > window.innerWidth - (12 + this.squareSize)
      || newX < 12
      || this.checkCollisions(newX, this.state.position.y, this.squareSize, this.elements)) {
      this.updateBall({position: this.state.position, direction: { dx: -this.state.direction.dx, dy: this.state.direction.dy }});
      this.magnitude = Math.sqrt(this.state.direction.dx ** 2 + this.state.direction.dy ** 2);
      this.normalizedSpeedX = this.state.direction.dx / this.magnitude;
    }
    else if (newY > window.innerHeight - (12 + this.squareSize)
      || newY < 12 || this.checkCollisions(this.state.position.x, newY, this.squareSize, this.elements)) {
      this.updateBall({position: this.state.position, direction: { dx: this.state.direction.dx, dy: -this.state.direction.dy }});
      this.magnitude = Math.sqrt(this.state.direction.dx ** 2 + this.state.direction.dy ** 2);
      this.normalizedSpeedY = this.state.direction.dy / this.magnitude;
    }
    else
      this.updateBall({position: { x: newX, y: newY }, direction: this.state.direction});
    this.animationRef = requestAnimationFrame(this.updatePosition);
  };

  handleResize = () => {
    let newPosition = this.state.position;
    newPosition = this.getRandomPosition();
    while (this.isValidSpawn(newPosition.x, newPosition.y, this.squareSize) === false) {
      newPosition = this.getRandomPosition();
    }
    this.updateBall({position: newPosition, direction: this.state.direction});
    this.speedMultiplier = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 700;
    this.squareSize = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 100;
  };

  componentDidMount() {
    this.elements.push(document.querySelector('.addBallButton'))
    this.elements.push(document.querySelector('.removeBallButton'))
    this.elements.push(document.querySelector('.signup-button'));
    this.elements.push(document.querySelector('.signin-button'));
    this.elements.push(document.querySelector('.signin42-button'));
    this.elements.push(document.querySelector('.signup-div'));
    this.elements.push(document.querySelector('.signin-div'));
    let newPosition = this.state.position;
    const speedSlider = document.getElementById('myRange');

    window.addEventListener("resize", this.handleResize);
    if (this.state.start === 0) {
      while (this.isValidSpawn(newPosition.x, newPosition.y, this.squareSize) === false) {
        newPosition = this.getRandomPosition();
      }
      this.setState({ start: 1 });
      this.updateBall({position: newPosition, direction: this.state.direction});
    }
    this.animationRef = requestAnimationFrame(this.updatePosition);
    this.intervalId = setInterval(() => {
    }, 10);
    // @ts-ignore: Object is possibly 'null'.
    speedSlider.addEventListener('input', this.handleSpeedChange);
    this.handleSpeedChange();
  }

  componentWillUnmount() {
    const speedSlider = document.getElementById('myRange');
    cancelAnimationFrame(this.animationRef);
    clearInterval(this.intervalId);
    speedSlider!.removeEventListener('input', this.handleSpeedChange);
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
