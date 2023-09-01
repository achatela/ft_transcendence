import { Component, Dispatch, SetStateAction} from 'react';
import './css/BouncingBall.css';

interface State {
  position: { x: number, y: number };
  direction: { dx: number, dy: number };
}

class BouncingBall extends Component<{index: number, speed: number, balls: any[], setBalls: Dispatch<SetStateAction<any[]>>}, State> {
  speed: number;
  animationRef: number;
  lastFrameTime: number;
  speedMultiplier: number;
  squareSize: number;
  bordersWidth: number;
  magnitude: number;
  normalizedSpeedX: number;
  normalizedSpeedY: number;
  elements: Array<any>;
  constructor(props: {index: number, speed: number, balls: any[], setBalls: Dispatch<SetStateAction<any[]>>}) {
    super(props);
    this.state = {
      position: props.balls[props.index].position,
      direction: props.balls[props.index].direction,
    };
    this.speed = props.speed;
    this.animationRef = 0;
    this.lastFrameTime = performance.now();
    this.bordersWidth = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 150;
    this.speedMultiplier = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 1000;
    this.squareSize = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 100;
    this.magnitude = Math.sqrt(this.state.direction.dx ** 2 + this.state.direction.dy ** 2);
    this.normalizedSpeedX = this.state.direction.dx / this.magnitude;
    this.normalizedSpeedY = this.state.direction.dy / this.magnitude;
    this.elements = [];
  }

  handleSpeedChange = () => {
    const speedSlider = document.getElementById('myRange');
    // @ts-ignore: Object is possibly 'null'.
    this.speed = speedSlider.value;
  };

  checkCollisionsX = (x: number) => {
    if (x >= window.innerWidth - (this.squareSize + this.bordersWidth) || x <= this.bordersWidth)
      return true;
    return false;
  };

  checkCollisionsY = (y: number) => {
    return (y >= window.innerHeight - (this.squareSize + this.bordersWidth) || y <= this.bordersWidth)
  };

  checkCollisions = (x: number, y: number) => {
    for (const element of this.elements) {
      const rect = element?.getBoundingClientRect();
      if (x <= rect?.right && x + this.squareSize >= rect?.left && y <= rect?.bottom && y + this.squareSize >= rect?.top) {
        return true;
      }
    }
    return false;
  };

  

  getRandomPosition = () => {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    };
  };

  updatePosition = () => {
    const newX = this.state.position.x + this.normalizedSpeedX * this.speed * this.speedMultiplier;
    const newY = this.state.position.y + this.normalizedSpeedY * this.speed * this.speedMultiplier;
    if (this.checkCollisionsX(newX) || this.checkCollisions(newX, this.state.position.y)) {
      const newDirection = { dx: -this.state.direction.dx, dy: this.state.direction.dy };
      this.magnitude = Math.sqrt(newDirection.dx ** 2 + newDirection.dy ** 2);
      this.normalizedSpeedX = newDirection.dx / this.magnitude;
      let newPosition = {
        x: this.state.position.x + this.normalizedSpeedX * this.speed * this.speedMultiplier,
        y: this.state.position.y + this.normalizedSpeedY * this.speed * this.speedMultiplier
      };
      while ((this.checkCollisionsX(newPosition.x) || this.checkCollisionsY(newPosition.y) || this.checkCollisions(newPosition.x, newPosition.y)) && window.innerHeight - this.bordersWidth * 2 > this.squareSize)
        newPosition = this.getRandomPosition();
      this.setState({position: newPosition, direction: newDirection}, () => {
        const balls = JSON.parse(sessionStorage.getItem('balls'));
        if (!balls)
          return;
        balls[this.props.index] = { position: this.state.position, direction: this.state.direction };
        sessionStorage.setItem('balls', JSON.stringify(balls));
      })
    }
    else if (this.checkCollisionsY(newY) || this.checkCollisions(this.state.position.x, newY)) {
      const newDirection = { dx: this.state.direction.dx, dy: -this.state.direction.dy };
      this.magnitude = Math.sqrt(newDirection.dx ** 2 + newDirection.dy ** 2);
      this.normalizedSpeedY = newDirection.dy / this.magnitude;
      let newPosition = {
        x: this.state.position.x + this.normalizedSpeedX * this.speed * this.speedMultiplier,
        y: this.state.position.y + this.normalizedSpeedY * this.speed * this.speedMultiplier
      };
      while ((this.checkCollisionsX(newPosition.x) || this.checkCollisionsY(newPosition.y) || this.checkCollisions(newPosition.x, newPosition.y)) && window.innerHeight - this.bordersWidth * 2 > this.squareSize)
        newPosition = this.getRandomPosition();
      this.setState({position: newPosition, direction: newDirection}, () => {
        const balls = JSON.parse(sessionStorage.getItem('balls'));
        if (!balls)
          return;
        balls[this.props.index] = { position: this.state.position, direction: this.state.direction };
        sessionStorage.setItem('balls', JSON.stringify(balls));
      })
    }
    else {
      this.setState({position: { x: newX, y: newY }}, () => {
        const balls = JSON.parse(sessionStorage.getItem('balls'));
        if (!balls)
          return;
        balls[this.props.index] = { position: this.state.position, direction: this.state.direction };
        sessionStorage.setItem('balls', JSON.stringify(balls));
      })
    }
    this.animationRef = requestAnimationFrame(this.updatePosition);
  }

  handleResize = () => {
    if ((this.checkCollisionsX(this.state.position.x) || this.checkCollisionsY(this.state.position.y) || this.checkCollisions(this.state.position.x, this.state.position.y)) && window.innerHeight - this.bordersWidth * 2 > this.squareSize) {
      let newPosition = this.getRandomPosition();
      while ((this.checkCollisionsX(newPosition.x) || this.checkCollisionsY(newPosition.y) || this.checkCollisions(newPosition.x, newPosition.y)) && window.innerHeight - this.bordersWidth * 2 > this.squareSize)
        newPosition = this.getRandomPosition();
      this.setState({position: newPosition}, () => {
        const balls = JSON.parse(sessionStorage.getItem('balls'));
        if (!balls)
          return;
        balls[this.props.index] = { position: this.state.position, direction: this.state.direction };
        sessionStorage.setItem('balls', JSON.stringify(balls));
      });
    }
    this.bordersWidth = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 75;
    this.speedMultiplier = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 750;
    this.squareSize = (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 100;
  };

  componentDidMount() {
    const elements = []
    elements.push(document.querySelector('.addBallButton'));
    elements.push(document.querySelector('.removeBallButton'));
    elements.push(document.querySelector('.signup-button'));
    elements.push(document.querySelector('.signin-button'));
    elements.push(document.querySelector('.signin42-button'));
    elements.push(document.querySelector('.signup-div'));
    elements.push(document.querySelector('.signin-div'));
    elements.forEach(element => {
      if (element) {
        this.elements.push(element);
      }
    });
    const speedSlider = document.getElementById('myRange');

    window.addEventListener("resize", this.handleResize);
    // @ts-ignore: Object is possibly 'null'.
    this.animationRef = requestAnimationFrame(this.updatePosition);
    speedSlider.addEventListener('input', this.handleSpeedChange);
  }

  componentWillUnmount() {
    const speedSlider = document.getElementById('myRange');
    cancelAnimationFrame(this.animationRef);
    speedSlider!.removeEventListener('input', this.handleSpeedChange);
  }

  

  render() {
    return (
      <div className="bouncing-ball" style={{ left: this.state.position.x, top: this.state.position.y }}></div>
    );
  }
}

export default BouncingBall;
