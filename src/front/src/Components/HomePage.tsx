import { useEffect, useRef, useState } from 'react';
import BouncingBall from './BouncingBall';
import SpeedSlider from './SpeedSlider';
import AddBallButton from './AddBallButton';
import RemoveBallButton from './RemoveBallButton';
import axios from 'axios';
import './css/HomePage.css';
import { promises } from 'dns';

const usernameAlreadyExists = () => {
  return (
    <p className="alreadyExists">Username already exists</p>
  );
}

const loginNotUnique = () => {
  return (
    <p className="loginNotUnique">You already created a user</p>
  );
}

const loginNot = () => {
  return (
    <p className="loginNot">No user found with your login</p>
  )
}

export default function HomePage(props: any) {
  const loginDivRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  const [balls, setBalls] = useState([{ x: 900, y: 100 }]);
  const [showErrorUser, setShowErrorUser] = useState(false);
  const [showErrorUnique, setShowErrorUnique] = useState(false);
  const [showErrorNot, setShowErrorNot] = useState(false);

  function addBall() {
    setBalls((prevBalls) => [
      ...prevBalls,
      { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
    ]);
  }

  function removeBall() {
    setBalls((prevBalls) => {"accessToken"
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

    if (sessionStorage.getItem('sign in') === 'true'){
      sessionStorage.setItem('sign in', 'false');
      if (code){
        const request = await axios.post('http://localhost:3333/auth/verify_sign_in', JSON.stringify({ code: code }), {headers: { 'Content-Type': 'application/json'}});
        if (request.data.success == true) {
          sessionStorage.removeItem('accessToken')
          sessionStorage.setItem("accessToken", request.data.accessToken);
          sessionStorage.setItem("login", request.data.login);
          sessionStorage.setItem("refreshToken", request.data.refreshToken);
          window.location.href = 'http://localhost:3133/profile';
        }
        else {
          setShowErrorUnique(false)
          setShowErrorUser(false)
          setShowErrorNot(true)
          console.error(request.data.error);
        }
      }
      else
        ;
      return ;
    }
    if (code) {
      const username = sessionStorage.getItem('username');
      const request = await axios.post('http://localhost:3333/auth/get_code', JSON.stringify({ code: code, username: username }), {headers: { 'Content-Type': 'application/json'}});
      if (request.data.success == true) {
        sessionStorage.setItem("accessToken", request.data.accessToken);
        sessionStorage.setItem("login", request.data.login);
        sessionStorage.setItem("refreshToken", request.data.refreshToken);
        window.location.href = 'http://localhost:3133/profile';
      }
      else {
        console.error(request.data.error);
        sessionStorage.removeItem('username')
        setShowErrorUser(false);
        setShowErrorNot(false);
        setShowErrorUnique(true);
      }
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
      setShowErrorUnique(false)
      setShowErrorNot(false)
      setShowErrorUser(true);
    }
  }

  async function redirectSignIn(): Promise<void> {
    sessionStorage.setItem('sign in', 'true');
    const response = await axios.post('http://localhost:3333/auth/redirect',JSON.stringify({username: undefined}), {headers: { 'Content-Type': 'application/json'}});
    if (response.data.success === true) {
      window.location.href = response.data.url;
    }
    else if (response.data.success === false) {
      // @ts-ignore: Object is possibly 'null'.
      console.log(answer.error);
      setShowErrorUnique(false)
      setShowErrorNot(false)
      setShowErrorUser(true);
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
        <button className="sign-in-button" type="button" onClick={redirectSignIn}>Sign In</button>
      </div>
      {showErrorUser && usernameAlreadyExists()}
      {showErrorUnique && loginNotUnique()}
      {showErrorNot && loginNot()}
      {balls.map((ball, index) => (
      <BouncingBall key={index} loginDiv={loginDivRef} speed={speed}/>
      ))}
    <AddBallButton onAddBall={addBall}/>
    <RemoveBallButton onRemoveBall={removeBall} />
    </div>
  );
}
