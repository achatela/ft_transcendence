import React, { useEffect, useRef, useState } from 'react';
import BouncingBall from './BouncingBall';
import SpeedSlider from './SpeedSlider.js';
import AddBallButton from './AddBallButton';
import RemoveBallButton from './RemoveBallButton';

export default function HomePage(props) {
  const loginDivRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  const [balls, setBalls] = useState([{ x: 900, y: 100 }]);

  function addBall() {
    setBalls((prevBalls) => [
      ...prevBalls,
      { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
    ]);
  }

  function removeBall() {
    setBalls((prevBalls) => {
      if (prevBalls.length > 1) {
        return prevBalls.slice(0, -1);
      } else {
        return prevBalls;
      }
    });
  }

  useEffect(() => {
    const togglePasswordButton = document.querySelector(".toggle-password");
    const passwordInput = document.querySelector(".password-input");

    function handleClick() {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePasswordButton.innerHTML = '&#128064;'; // Change to eye-slash icon
      } else {
        passwordInput.type = "password";
        togglePasswordButton.innerHTML = '🫣'; // Change back to eye icon
      }
    }

    togglePasswordButton.addEventListener("click", handleClick);

    return () => {
      togglePasswordButton.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div id="tmp">
      <SpeedSlider onSpeedChange={setSpeed} />
      <h1 className="transcendence-title">PONG</h1>
      <div ref={loginDivRef} className="login-div">
        <input className="login-input" type="text" placeholder="Login" />
        <div className="password-wrapper">
          <input className="password-input" type="password" placeholder="Password" />
          <button className="toggle-password" type="button">🫣</button>
        </div>
        <div className="remember-me-wrapper">
          <input type="checkbox" id="remember-me" name="remember-me" className="remember-me-checkbox" />
          <label className="password-label" htmlFor="remember-me">Remember me</label>
        </div>
        <button className="sign-up-button" type="button">Sign Up</button>
      </div>
      <BouncingBall x={900} y={100} loginDiv={loginDivRef} speed={speed} />{balls.map((ball, index) => (
      <BouncingBall
        key={index}
        x={ball.x}
        y={ball.y}
        loginDiv={loginDivRef}
        speed={speed}
      />
    ))}
    <AddBallButton onAddBall={addBall} loginDiv={loginDivRef} speed={speed} />
    <RemoveBallButton onRemoveBall={removeBall} />
    </div>
  );
}
