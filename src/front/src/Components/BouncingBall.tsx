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
    this.speed = 2;
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
    newX += normalisedSpeedX * speedSlider.value;
    // @ts-ignore: Object is possibly 'null'.
    newY += normalisedSpeedY * speedSlider.value;

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