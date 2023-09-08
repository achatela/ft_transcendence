import { useEffect, useRef, useState } from 'react';
import BouncingBallsUI from './BouncingBallsUI';
import axios from 'axios';
import './css/HomePage.css';
import './css/BouncingBallsUI.css';

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

export default function HomePage(props: any) {
  const [hover42, setHover42] = useState(false);

  async function handlePageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log("code exists")
      try {
        const request = await axios.post('http://' + domain + ':3333/auth/verify_sign_in_42/', JSON.stringify({ code: code }), { headers: { 'Content-Type': 'application/json' } });
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
          if (request.data.error == "user already connected")
            alert(request.data.error);
        }
      }
      catch (err) {
        console.log(err);
      }
    }
  }

  useEffect(() => {
    handlePageLoad();
  }, []);

  async function redirectFortyTwo(): Promise<void> {
    const response = await axios.get('http://' + domain + ':3333/auth/redirect_forty_two');
    window.location.href = response.data.url;
  }


  return (
    <>
      <h1 className="transcendence-title">PONG</h1>
      <div className="sign-div">
        <button className="signup-button" type="button" onClick={() => { window.location.href = "/sign_up" }}>Sign Up</button>
        <button className="signin-button" type="button" onClick={() => { window.location.href = "/sign_in" }}>Sign In</button>
        <button className="signin42-button" type="button" onClick={redirectFortyTwo} onMouseEnter={() => { setHover42(true) }} onMouseLeave={() => { setHover42(false) }}>
          Sign
          {
            hover42 ? (<img src={'http://' + domain + ':3133/black42logo.png'} alt="Image" className="logo42" style={{ width: 'calc(1.25vw + 1.25vh)', marginLeft: 'calc(0.15vw + 0.15vh)' }} />)
              : (<img src={'http://' + domain + ':3133/white42logo.png'} alt="Image" className="logo42" style={{ width: 'calc(1.25vw + 1.25vh)', marginLeft: 'calc(0.15vw + 0.15vh)' }} />)
          }
        </button>
      </div>
    </>
  );
}
