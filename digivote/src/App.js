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
      <Hero />
      <VotingRights />
      <ElectionSecurity />
      <Footer />
    </div>
  );
}

export default App;