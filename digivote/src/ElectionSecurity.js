import React from 'react';
import './App.css';

const ElectionSecurity = () => {
  return (
    <section className="election-security-section">
      {/* Part 1: Split Hero Banner */}
      <div className="security-hero">
        <div className="security-hero-text">
          <h2>Your vote is safe</h2>
          <p>What happens after you vote? Whether you voted online or in person, there are processes in place to make sure your vote is secure. State and local election offices take steps to make sure your vote is counted correctly and your voice is represented.</p>
        </div>
        <div className="security-hero-image">
          <img src="/Vote.jpg" alt="Vote" />
        </div>
      </div>

      {/* Part 2: Information Block */}
      <div className="security-info">
        <h3>State governments make sure elections are secure and accurate</h3>
        <h4>More resources</h4>
        <p>Contact your local election office to learn more about the specific actions they take to keep elections safe and secure. Multiple federal government agencies are also working to protect your vote.</p>
      </div>
    </section>
  );
};

export default ElectionSecurity;
