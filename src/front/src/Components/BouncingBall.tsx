import { Component } from 'react';
import './css/BouncingBall.css';

interface State {
  position: { x: number, y: number };
  direction: { dx: number, dy: number };
  start: number;
}

class BouncingBall extends Component<{x: number, y: number, speed: number, loginDiv: any}, State> {
  animationRef: number;
  lastFrameTime: number;
  speed: number;
  intervalId: any;
  constructor(props: {x: number, y: number, speed: number, loginDiv: any}) {
    super(props);
    this.state = {
      start: 0,
      position: { x: props.x, y: props.y},
      direction: { dx: 1, dy: 1 },
    };
    this.state.position.x = Math.random() * window.innerWidth;
    this.state.position.y = Math.random() * window.innerHeight;
    this.state.direction.dx = Math.random() * 2 - 1;
    this.state.direction.dy = Math.random() * 2 - 1;
    this.animationRef = 0;
    this.lastFrameTime = performance.now();
    this.speed = 0.2;
  }

  checkCollision = (newX: number, newY: number, squareSize: number, rect: {right: number, left: number, bottom: number, top: number}) => {
    return (
      newX < rect.right &&
      newX + squareSize > rect.left &&
      newY < rect.bottom &&
      newY + squareSize > rect.top
    );
  };

  updatePosition = () => {
    const { position, direction } = this.state;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    const speedSlider = document.getElementById('myRange');

    // @ts-ignore: Object is possibly 'null'.
    const newX = position.x + direction.dx * this.speed * deltaTime * speedSlider.value;
    // @ts-ignore: Object is possibly 'null'.
    const newY = position.y + direction.dy * this.speed * deltaTime * speedSlider.value;
    const squareSize = 40;

    const loginDiv = document.querySelector('.login-div');
    // @ts-ignore: Object is possibly 'null'.
    const rect = loginDiv.getBoundingClientRect();

    if (
      newX > window.innerWidth - (12 + squareSize)||
      newX < 12 ||
      this.checkCollision(newX, position.y, squareSize, rect)
    ) {
      this.setState((prevState) => ({
        direction: { ...prevState.direction, dx: -prevState.direction.dx },
      }));
    } else if (
      newY > window.innerHeight  - (12 + squareSize)||
      newY < 12 ||
      this.checkCollision(position.x, newY, squareSize, rect)
    ) {
      this.setState((prevState) => ({
        direction: { ...prevState.direction, dy: -prevState.direction.dy },
      }));
    } else {
      this.setState({
        position: { x: newX, y: newY },
      });
    }

    this.animationRef = requestAnimationFrame(this.updatePosition);
  };

  componentDidMount() {
    this.animationRef = requestAnimationFrame(this.updatePosition);
    this.intervalId = setInterval(() => {
      this.forceUpdate();
    }, 10);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationRef);
    clearInterval(this.intervalId);
  }

  render() {
  const { position } = this.state;
  if (this.state.start === 0){
    while (this.checkCollision(position.x, position.y, 40, this.props.loginDiv)){
      this.setState({
        position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight},
      });
    }
    this.setState({start: 1});
  }
  return (
    <div className="bouncing-ball" style={{ left: position.x, top: position.y }}></div>
  );
}

}

export default BouncingBall;