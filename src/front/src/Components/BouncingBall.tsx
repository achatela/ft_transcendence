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

  updateBall = (ball: {position: {x: number, y: number}, direction: {dx: number, dy: number}}) => {
    this.setState({position: ball.position, direction: ball.direction});
    const tmpBalls = JSON.parse(sessionStorage.getItem('balls'));
    tmpBalls[this.props.index] = ball;
    this.props.setBalls(tmpBalls);
    sessionStorage.setItem('balls', JSON.stringify(tmpBalls));
  }
  

  handleSpeedChange = () => {
    const speedSlider = document.getElementById('myRange');
    // @ts-ignore: Object is possibly 'null'.
    this.speed = speedSlider.value;
  };

  isValidSpawn = (x: number, y: number, squareSize: number) => {
    // Check if the position is within the bounds of the window
    if (
      x <= this.bordersWidth + squareSize ||
      x >= window.innerWidth - (this.bordersWidth + squareSize) ||
      y <= this.bordersWidth + squareSize ||
      y >= window.innerHeight - (this.bordersWidth + squareSize)
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
    if (this.speed > 0) {
      const newX = this.state.position.x + this.normalizedSpeedX * this.speed * this.speedMultiplier;
      const newY = this.state.position.y + this.normalizedSpeedY * this.speed * this.speedMultiplier;
      if (newX > window.innerWidth - (this.squareSize + this.bordersWidth) || newX < this.bordersWidth || this.checkCollisions(newX, this.state.position.y, this.squareSize, this.elements)) {
        // this.updateBall({position: this.state.position, direction: { dx: -this.state.direction.dx, dy: this.state.direction.dy }});
        this.setState({direction: { dx: -this.state.direction.dx, dy: this.state.direction.dy }}, () => {
          const tmpBalls = JSON.parse(sessionStorage.getItem('balls'));
          tmpBalls[this.props.index] = {position: this.state.position, direction: this.state.direction};
          this.props.setBalls(tmpBalls);
          sessionStorage.setItem('balls', JSON.stringify(tmpBalls));
          this.magnitude = Math.sqrt(this.state.direction.dx ** 2 + this.state.direction.dy ** 2);
          this.normalizedSpeedX = this.state.direction.dx / this.magnitude;
        });
      }
      else if (newY > window.innerHeight - (this.squareSize + this.bordersWidth) || newY < this.bordersWidth || this.checkCollisions(this.state.position.x, newY, this.squareSize, this.elements)) {
        // this.updateBall({position: this.state.position, direction: { dx: this.state.direction.dx, dy: -this.state.direction.dy }});
        this.setState({direction: { dx: this.state.direction.dx, dy: -this.state.direction.dy }}, () => {
          const tmpBalls = JSON.parse(sessionStorage.getItem('balls'));
          tmpBalls[this.props.index] = {position: this.state.position, direction: this.state.direction};
          this.props.setBalls(tmpBalls);
          sessionStorage.setItem('balls', JSON.stringify(tmpBalls));
          this.magnitude = Math.sqrt(this.state.direction.dx ** 2 + this.state.direction.dy ** 2);
          this.normalizedSpeedY = this.state.direction.dy / this.magnitude;
        });
      }
      else {
        this.updateBall({position: { x: newX, y: newY }, direction: this.state.direction});
      }
    }
    this.animationRef = requestAnimationFrame(this.updatePosition);
  };

  handleResize = () => {
    let newPosition = this.state.position;
    newPosition = this.getRandomPosition();
    while (this.isValidSpawn(newPosition.x, newPosition.y, this.squareSize) === false) {
      newPosition = this.getRandomPosition();
    }
    this.updateBall({position: newPosition, direction: this.state.direction});
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
    // let newPosition = this.state.position;
    const speedSlider = document.getElementById('myRange');

    window.addEventListener("resize", this.handleResize);
    // while (this.isValidSpawn(newPosition.x, newPosition.y, this.squareSize) === false) {
    //   newPosition = this.getRandomPosition();
    // }
    // this.updateBall({position: newPosition, direction: this.state.direction});
    // @ts-ignore: Object is possibly 'null'.
    this.animationRef = requestAnimationFrame(this.updatePosition);
    speedSlider.addEventListener('input', this.handleSpeedChange);
  }

  componentWillUnmount() {
    const speedSlider = document.getElementById('myRange');
    cancelAnimationFrame(this.animationRef);
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
