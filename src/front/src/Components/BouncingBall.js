import React, { Component } from 'react';
import './css/BouncingBall.css';

class BouncingBall extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: { x: props.x, y: props.y},
      direction: { dx: 1, dy: 1 },
    };
    this.animationRef = null;
    this.lastFrameTime = performance.now();
    this.speed = 0.2;
  }

  checkCollision = (newX, newY, squareSize, rect) => {
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

    const newX = position.x + direction.dx * this.speed * deltaTime * this.props.speed;
    const newY = position.y + direction.dy * this.speed * deltaTime * this.props.speed;
    const squareSize = 40;

    const loginDiv = document.querySelector('.login-div');
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
    return (
      <div
        className="bouncing-ball"
        style={{
          left: position.x,
          top: position.y,
        }}
      />
    );
  }
}

export default BouncingBall;
