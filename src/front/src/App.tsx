import './App.css';
import React from 'react';
import HomePage from './Components/HomePage'
import './App.css';
import ModePage from './Components/ModePage'
import ProfilePage from './Components/ProfilePage'
import GameBoard from './Components/GameBoard'
import SocialPage from './Components/SocialPage'
import TwoFa from './Components/TwoFa'
import NavBar from './Components/NavBar'
import MatchHistory from './Components/MatchHistory'
import PageNotFound from './Components/PageNotFound'
import SignUp from './Components/SignUp'
import SignIn from './Components/SignIn'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BouncingBallsUI from './Components/BouncingBallsUI';
import { useEffect } from "react";
import axios from "axios"

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const domain = url.hostname;

function App() {

  async function pageLoad() {
    if (sessionStorage.getItem("fix") == "one") {
      sessionStorage.removeItem("fix");
      return;
    }
    if (sessionStorage.getItem("queueing") === "Classic Pong") {
      const response = await axios.post('http://' + domain + ':3333/pong/classic/queue_down/',
        JSON.stringify({
          username: sessionStorage.getItem('username'),
          refreshToken: sessionStorage.getItem('refreshToken'),
          accessToken: sessionStorage.getItem('accessToken'),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success === true) {
        sessionStorage.setItem('accessToken', response.data.accessToken);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        sessionStorage.setItem("queueing", "");
      }
      else {
        sessionStorage.setItem("queueing", "");
      }
    }
    else if (sessionStorage.getItem("queueing") === "Custom Pong") {
      const response = await axios.post('http://' + domain + ':3333/pong/custom/queue_down/',
        JSON.stringify({
          username: sessionStorage.getItem('username'),
          refreshToken: sessionStorage.getItem('refreshToken'),
          accessToken: sessionStorage.getItem('accessToken'),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success === true) {
        sessionStorage.setItem('accessToken', response.data.accessToken);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        sessionStorage.setItem("queueing", "");
      }
      else {
        sessionStorage.setItem("queueing", "");
      }
    }
  }

  async function checkTwoFaSession() {
    if (sessionStorage.getItem('username') === null || url.pathname === "/" || url.pathname === "/two_fa") {
      return;
    }
    const request = await axios.post("http://" + domain + ":3333/2fa/check_session/",
      JSON.stringify({ username: sessionStorage.getItem('username') }),
      { headers: { 'Content-Type': 'application/json' } })

    if (request.data.success !== true) {
      window.location.href = "/two_fa";
    }
  }

  useEffect(() => {
    console.log(sessionStorage.getItem('accessToken'));
    if (sessionStorage.getItem('accessToken') == "undefined" || sessionStorage.getItem('refreshToken') == "undefined") {
      sessionStorage.clear();
      window.location.href = "/";
      return;
    }
    pageLoad();
    checkTwoFaSession();
  }, []);

  return (
    <>
      <BrowserRouter>
        {sessionStorage.getItem('username') !== null && (<>
          <NavBar />
        </>)}
        <Routes>
          {sessionStorage.getItem('username') !== null && (
            <>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:profileId" element={<ProfilePage />} />
              <Route path="/mode" element={<ModePage />} />
              <Route path="/game" element={<GameBoard />} />
              <Route path="/social" element={<SocialPage />} />
              <Route path="/two_fa" element={<TwoFa />} />
              <Route path="/history" element={<MatchHistory />} />
              <Route path="/history/:profileId" element={<MatchHistory />} />
            </>
          )}
          <Route path="/" element={<HomePage />} />
          <Route path="/sign_up" element={<SignUp />} />
          <Route path="/sign_in" element={<SignIn />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
      {window.location.pathname === "/" || window.location.pathname === "/sign_up" || window.location.pathname === "/sign_in" ? (
        <BouncingBallsUI />
      ) : null}
    </>
  );
}

export default App;