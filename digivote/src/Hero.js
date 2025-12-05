import React from 'react';
import './App.css';

const Hero = () => {
  return (
    <section className="hero-section">
      {/* Background Elements */}
      <div className="bg-city-texture"></div>
      
      {/* Flag Image */}
      <div className="flag-decoration">
        <img src="/flag.png" alt="US Flag" className="waving-flag" />
      </div>
      
      {/* Left Content */}
      <div className="hero-content">
        <div className="flag-decoration">
        </div>
        
        <h4 className="sub-headline">KENYA</h4>
        
        <h1 className="main-headline">
          Vote for the <br />
          <span className="highlight-red">best candidate!</span> <br />
          Choose peace.<br/> Choose progress.
        </h1>

        <p className="description">
         Your voice sets the tone. Every vote pushes the nation forward — powered by DigiVote’s simple, secure, and transparent system that keeps your choice protected and your future unlocked.
        </p>

        <button className="cta-button">
          VOTE FOR YOUR FUTURE <span className="check-box">✔</span>
        </button>
        
        {/* The floating bubbles on the left */}
        <div className="side-indicators">
          <div className="indicator-item">
            <span className="indicator-number">01</span>
            <span className="indicator-text">Register as a voter</span>
          </div>
          <div className="indicator-item">
            <span className="indicator-number">02</span>
            <span className="indicator-text">Verify your voting details</span>
          </div>
          <div className="indicator-item">
            <span className="indicator-number">03</span>
            <span className="indicator-text">Login and vote</span>
          </div>
        </div>
      </div>

      {/* Center Visual (Statue) */}
      <div className="hero-visual">
        <img src="/statue.png" alt="Statue of Liberty" className="statue-img" />
      </div>

      {/* Right Geometric Shapes */}
      <div className="geometric-shapes">
        <div className="blue-triangle"></div>
        <div className="red-triangle"></div>
        <div className="city-overlay"></div>
      </div>
    </section>
  );
};

export default Hero;