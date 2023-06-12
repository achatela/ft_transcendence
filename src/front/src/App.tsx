import './App.css';
import React from 'react';
import HomePage from './Components/HomePage'
import './App.css';
import ModePage from './Components/ModePage'
import ProfilePage from './Components/ProfilePage'
import GameBoard from './Components/GameBoard'
import SocialPage from './Components/SocialPage'
import Chat from './Components/Chat'
import TwoFa from './Components/TwoFa'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mode" element={<ModePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:profileId" element={<ProfilePage />} />
        <Route path="/game" element={<GameBoard />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/two_fa" element={<TwoFa />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;