import { useEffect, useRef, useState } from 'react';
import BouncingBallsUI from './BouncingBallsUI';
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
  const [speed, setSpeed] = useState(1);
  const [balls, setBalls] = useState([{ x: 900, y: 100 }]);
  const [showErrorUser, setShowErrorUser] = useState(false);
  const [showErrorUnique, setShowErrorUnique] = useState(false);
  const [showErrorNot, setShowErrorNot] = useState(false);
  const [hover42, setHover42] = useState(false);

  function addBall() {
    setBalls((prevBalls) => [
      ...prevBalls,
      { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
    ]);
  }

  function removeBall() {
    setBalls((prevBalls) => {
      "accessToken"
      if (prevBalls.length > 0) {
        return prevBalls.slice(0, -1);
      } else {
        return prevBalls;
      }
    });
  }

  async function handlePageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (sessionStorage.getItem('sign in') === 'true') {
      sessionStorage.setItem('sign in', 'false');
      if (code) {
          const request = await axios.post('http://localhost:3333/auth/verify_sign_in_42/', JSON.stringify({ code: code }), { headers: { 'Content-Type': 'application/json' } });
        if (request.data.success == true) {
          sessionStorage.removeItem('accessToken')
          sessionStorage.setItem("accessToken", request.data.accessToken);
          sessionStorage.setItem("username", request.data.username);
          sessionStorage.setItem("refreshToken", request.data.refreshToken);
          if (request.data.twoFa === false)
            window.location.href = '/profile';
          else
            window.location.href = '/two_fa';
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
      return;
    }
  }


  useEffect(() => {
    handlePageLoad();
  }, []);

  async function redirectFortyTwo(): Promise<void> {
    sessionStorage.setItem('sign in', 'true');
    const response = await axios.get('http://localhost:3333/auth/redirect_forty_two');
      window.location.href = response.data.url;
  }


  return (
    <div id="tmp">
      <h1 className="transcendence-title">PONG</h1>
        {showErrorUser && usernameAlreadyExists()}
        {showErrorUnique && loginNotUnique()}
        {showErrorNot && loginNot()}
      <div className="sign-div">
        <button className="signup-button" type="button" onClick={() => { window.location.href = "/sign_up" }}>Sign Up</button>
        <button className="signin-button" type="button" onClick={() => { window.location.href = "/sign_in" }}>Sign In</button>
        <button className="signin42-button" type="button" onClick={redirectFortyTwo} onMouseEnter={() => {setHover42(true)}} onMouseLeave={() => {setHover42(false)}}>
          Sign
          {
            hover42 ? (<img src={'http://localhost:3133/black42logo.png'} alt="Image" className="logo42" style={{width: '2.5vw', marginLeft: '0.25vw'}}/>)
            :(<img src={'http://localhost:3133/white42logo.png'} alt="Image" className="logo42" style={{width: '2.5vw', marginLeft: '0.25vw'}}/>)
          }
        </button>
      </div>
      <BouncingBallsUI queryType={1}/>
    </div>
  );
}
