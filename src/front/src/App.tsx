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
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import BouncingBall from './Components/BouncingBall';


function App() {

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
    ): null}
    </>
  );
}

export default App;