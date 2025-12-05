import React from 'react';
import { FaFire, FaMedal, FaGlobe, FaWheelchair, FaMapMarkerAlt, FaBalanceScale, FaCalendarAlt } from 'react-icons/fa';
import './App.css';

const VotingRights = () => {
  const cards = [
    { icon: FaFire, title: "Voting as a new Kenyan citizen", text: "Find out what you need to know about voting and participating in Kenyan elections." },
    { icon: FaMedal, title: "Voting as a military service member", text: "Learn how you and your family can register and vote from anywhere you're stationed." },
    { icon: FaGlobe, title: "Voting from outside of Kenya", text: "You can vote by mail, Kenyan ID number and Voter ID from anywhere in the world." },
    { icon: FaWheelchair, title: "Voting with a disability", text: "Know your rights and voting accommodations protected by law." },
    { icon: FaMapMarkerAlt, title: "Voting while unhoused", text: "You don't need a home address to register and vote." },
    { icon: FaBalanceScale, title: "Voting after a felony conviction", text: "Your eligibility to vote after a conviction can be different from state to state." },
    { icon: FaCalendarAlt, title: "Preparing to vote: age 18 and under", text: "Take steps now so you are ready to vote when you turn 18." }
  ];

  return (
    <section className="voting-rights-section">
      <div className="voting-rights-header">
        <h2>Know your voting rights</h2>
      </div>
      <div className="voting-rights-grid">
        {cards.map((card, index) => (
          <div key={index} className="voting-card">
            <div className="voting-card-icon">
              <card.icon />
            </div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VotingRights;
