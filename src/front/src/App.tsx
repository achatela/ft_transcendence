import './App.css';
import React from 'react';
import HomePage from './Components/HomePage'
import ModePage from './Components/ModePage'
import ProfilePage from './Components/ProfilePage'
import GameBoard from './Components/GameBoard'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" Component={HomePage} />
          <Route path="/mode" Component={ModePage} />
          <Route path="/profile" Component={ProfilePage} />
          <Route path="/game" Component={GameBoard} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;