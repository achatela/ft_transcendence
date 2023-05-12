import { useEffect, useRef, useState } from 'react';
import BouncingBall from './BouncingBall';
import SpeedSlider from './SpeedSlider';
import AddBallButton from './AddBallButton';
import RemoveBallButton from './RemoveBallButton';
import axios from 'axios';
import './css/HomePage.css';

const usernameAlreadyExists = () => {
  return (
    <p className="alreadyExists">Username already exists</p>
  );
}

const cannotBeEmpty = () => {
  return (
    <p className="cannotBeEmpty">Username cannot be empty</p>
  );
}

export default function HomePage(props: any) {
  const loginDivRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  const [balls, setBalls] = useState([{ x: 900, y: 100 }]);
  const [showError, setShowError] = useState(false);

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

  async function handlePageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
  
    if (code) {
      const username = sessionStorage.getItem('username');
      const request = await axios.post('http://localhost:3333/auth/get_code', JSON.stringify({ code: code, username: username }), {headers: { 'Content-Type': 'application/json'}});

      if (request.data.success == true) {}
      else {
        console.error(request.data.error);
      }
  
      sessionStorage.removeItem('username');
    }
  }  
  
  
  useEffect(() => {
    handlePageLoad();
  }, []);

  async function redirectFortyTwo(): Promise<void> {
    const loginInput = document.querySelector(".login-input");
    // @ts-ignore: Object is possibly 'null'.
    if (loginInput.value === "") {
      return ;
    }
    // @ts-ignore: Object is possibly 'null'.
    sessionStorage.setItem('username', loginInput.value);
  
    const response = await fetch('http://localhost:3333/auth/redirect',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // @ts-ignore: Object is possibly 'null'.
        body: JSON.stringify({username: loginInput.value}),
    });
    const answer = await response.json();
    if (answer.success === true) {
      window.location.href = answer.url;
    }
    else if (answer.success === false) {
      // @ts-ignore: Object is possibly 'null'.
      console.log(answer.error);
      setShowError(true);
    }
  }
  

  return (
    <div id="tmp">
      <SpeedSlider onSpeedChange={setSpeed} />
      <h1 className="transcendence-title">PONG</h1>
      <div ref={loginDivRef} className="login-div" id="login-div-id">
        <div className="password-wrapper">
          <input className="login-input" type="text" placeholder="Login"/>
        </div>
        <div className="remember-me-wrapper">
        </div>
          <button className="sign-up-button" type="button" onClick={redirectFortyTwo}>Sign Up</button>
      </div>
      {showError && usernameAlreadyExists()}
      {balls.map((ball, index) => (
      <BouncingBall key={index} loginDiv={loginDivRef} speed={speed}/>
      ))}
    <AddBallButton onAddBall={addBall}/>
    <RemoveBallButton onRemoveBall={removeBall} />
    </div>
  );
}
