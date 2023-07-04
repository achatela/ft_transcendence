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
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mode" element={<ModePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:profileId" element={<ProfilePage />} />
        <Route path="/game" element={<GameBoard />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/two_fa" element={<TwoFa />} />
        <Route path="/history" element={<MatchHistory />} />
        <Route path="/history/:profileId" element={<MatchHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;