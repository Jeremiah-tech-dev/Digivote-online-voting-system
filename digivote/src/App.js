import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import VotingRights from './VotingRights';
import ElectionSecurity from './ElectionSecurity';
import Footer from './Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="christmas-banner">
        <span className="festive-icon">🎄</span>
        <span className="festive-text">Kila La Heri - Merry Christmas & Happy New Year!</span>
        <span className="festive-icon">🎅</span>
        <span className="festive-icon">🎁</span>
        <span className="festive-icon">⭐</span>
      </div>
      <Hero />
      <VotingRights />
      <ElectionSecurity />
      <Footer />
    </div>
  );
}

export default App;