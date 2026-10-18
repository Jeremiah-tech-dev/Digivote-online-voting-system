import React, { useState, useEffect } from 'react';
import { FaVoteYea, FaUsers, FaCheckCircle, FaTachometerAlt, FaClipboardList, FaBriefcase, FaUserTie } from 'react-icons/fa';
import Footer from '../Footer';
import VotingPopup from './VotingPopup';
import { apiRequest } from '../api';
import { COUNTY_IMAGES, PartyLogo, displayName, groupCandidates, showFallbackImage, sortedCounties } from '../candidates';
import '../App.css';

const ELECTION_ID = 1;

const STATUS_MESSAGES = {
  upcoming: 'Voting has not opened yet. Please check back when the election opens.',
  closed: 'Voting has closed for this election.'
};

const CandidateGrid = ({ candidates }) => (
  <div className="candidates-grid">
    {candidates.map(candidate => (
      <div key={candidate.id} className="candidate-card">
        <img src={candidate.image_url || '/logo.png'} alt={`${candidate.first_name} ${candidate.last_name}`} className="candidate-image" onError={showFallbackImage} />
        <p className="candidate-name">{displayName(candidate)}</p>
        <PartyLogo candidate={candidate} className="party-logo" />
      </div>
    ))}
  </div>
);

const VotingDashboard = ({ onClose, voter, token }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showVotingPopup, setShowVotingPopup] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ totalVoters: 0, votersVoted: 0 });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, electionsData, candidatesData, me] = await Promise.all([
          apiRequest('/stats'),
          apiRequest('/elections'),
          apiRequest(`/elections/${ELECTION_ID}/candidates`),
          apiRequest('/me', { token })
        ]);
        setStats({ totalVoters: statsData.total_voters, votersVoted: statsData.voters_voted });
        setElection(electionsData.elections.find(e => e.id === ELECTION_ID) || null);
        setCandidates(candidatesData.candidates);
        setHasVoted(me.has_voted === true);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      }
    };
    loadDashboard();
  }, [token]);

  const grouped = groupCandidates(candidates);
  const counties = sortedCounties(grouped.counties);
  // One presidential race plus a governor and senator race per county
  const positionCount = (grouped.presidential.length ? 1 : 0) +
    counties.reduce((sum, c) => sum + (grouped.counties[c].governors.length ? 1 : 0) + (grouped.counties[c].senators.length ? 1 : 0), 0);
  const votingOpen = election?.status === 'active';

  const handleVoteNowClick = () => {
    if (hasVoted) {
      alert('You have already voted in this election.');
      return;
    }
    if (!votingOpen) return;
    setShowConfirmAlert(true);
  };

  const handleConfirmVoting = () => {
    setShowConfirmAlert(false);
    setShowVotingPopup(true);
  };

  const summaryCards = [
    { title: 'No. of Positions', value: positionCount, icon: FaBriefcase, color: 'blue' },
    { title: 'No. of Candidates', value: candidates.length, icon: FaUserTie, color: 'green' },
    { title: 'Total Voters', value: stats.totalVoters, icon: FaUsers, color: 'orange' },
    { title: 'Voters Voted', value: stats.votersVoted, icon: FaCheckCircle, color: 'red' }
  ];

  return (
    <div className="voting-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src="/IEBC.png" alt="IEBC Logo" className="sidebar-logo" />
          <h3>Voting Portal</h3>
        </div>

        <div className="sidebar-menu">
          <div className="menu-section">
            <p className="menu-label">REPORTS</p>
            <div
              className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveMenu('dashboard')}
            >
              <FaTachometerAlt /> Dashboard
            </div>
            <div
              className={`menu-item ${activeMenu === 'votes' ? 'active' : ''}`}
              onClick={() => setActiveMenu('votes')}
            >
              <FaVoteYea /> Votes
            </div>
          </div>

          <div className="menu-section">
            <p className="menu-label">ELECTION INFO</p>
            <div
              className={`menu-item ${activeMenu === 'positions' ? 'active' : ''}`}
              onClick={() => setActiveMenu('positions')}
            >
              <FaClipboardList /> Positions
            </div>
            <div
              className={`menu-item ${activeMenu === 'candidates' ? 'active' : ''}`}
              onClick={() => setActiveMenu('candidates')}
            >
              <FaUserTie /> Candidates
            </div>
          </div>
        </div>

        <button className="sidebar-logout" onClick={onClose}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Election Dashboard</h1>
          <p>Welcome to the voting portal. Review the election details below.</p>
        </div>

        {activeMenu === 'dashboard' && (
          <div className="dashboard-content">
            <div className="summary-cards">
              {summaryCards.map((card, index) => (
                <div key={index} className={`summary-card ${card.color}`}>
                  <div className="card-icon">
                    <card.icon />
                  </div>
                  <div className="card-info">
                    <h3>{card.value}</h3>
                    <p>{card.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="election-info-section">
              <div className="election-info-grid">
                <div className="election-info-left">
                  <h2>About This Election</h2>
                  <div className="info-box">
                    <p><strong>Election:</strong> {election ? election.title : 'Loading...'}</p>
                    <p><strong>Voting Status:</strong> {election ? election.status.charAt(0).toUpperCase() + election.status.slice(1) : '...'}</p>
                    <p><strong>Your County:</strong> {voter?.county}</p>
                    <p><strong>Positions Available:</strong> {positionCount} positions ({voter?.county} voters choose 3: President, Governor and Senator)</p>
                    <p><strong>Total Candidates:</strong> {candidates.length} candidates running</p>
                  </div>
                </div>

                <div className="election-info-right">
                  <h2>How to Vote</h2>
                  <ol className="voting-steps">
                    <li>Review all positions and candidates</li>
                    <li>Select your preferred candidate for each position</li>
                    <li>Review your choices before submitting</li>
                    <li>Submit your vote securely and keep your receipt code</li>
                  </ol>
                </div>
              </div>

              {election && !votingOpen && !hasVoted && (
                <p className="voting-closed-notice">{STATUS_MESSAGES[election.status]}</p>
              )}
              <button className="start-voting-btn" onClick={handleVoteNowClick} disabled={!votingOpen || hasVoted}>
                {hasVoted ? 'You have voted' : 'Vote Now'}
              </button>
            </div>
          </div>
        )}

        {activeMenu === 'votes' && (
          <div className="dashboard-content">
            <h2>Your Voting Status</h2>
            <p>
              {hasVoted
                ? 'You have cast your ballot in this election. Your choices are secret: they are stored without your name or ID.'
                : 'You have not voted yet in this election.'}
            </p>
          </div>
        )}

        {activeMenu === 'positions' && (
          <div className="dashboard-content">
            <h2>Available Positions</h2>
            <p className="positions-subtitle">You vote for the President and for the Governor and Senator of your own county</p>

            <div className="positions-list">
              <div className="position-card presidential">
                <img src="/kenyanl.webp" alt="Kenya" className="presidential-flag" />
                <div className="presidential-content">
                  <h3>Presidential</h3>
                </div>
                <img src="/kenyan.avif" alt="Kenya Flag" className="presidential-flag" />
              </div>

              {counties.map(county => (
                <div key={county} className="city-positions">
                  <h3 className="city-header">{county} City</h3>
                  {['Governor', 'Senator'].map(position => (
                    <div key={position} className="position-card">
                      <div>
                        <h4>{position} - {county} City</h4>
                        <p>Vote for {county} City {position}</p>
                      </div>
                      <img src={COUNTY_IMAGES[county] || '/flag.png'} alt={county} className="city-image mombasa-image" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'candidates' && (
          <div className="dashboard-content">
            <h2>All Candidates</h2>
            <p className="candidates-subtitle">Review all candidates running for various positions</p>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Presidential Candidates</h3>
              <CandidateGrid candidates={grouped.presidential} />
              <img src="/kenyan.avif" alt="Kenya Flag" className="position-logo" />
            </div>

            {counties.map(county => (
              <React.Fragment key={county}>
                {[['Governors', grouped.counties[county].governors], ['Senators', grouped.counties[county].senators]]
                  .filter(([, list]) => list.length > 0)
                  .map(([title, list]) => (
                    <div key={title} className="candidates-section">
                      <h3 className="candidates-position-title">{county} City - {title}</h3>
                      <img src={COUNTY_IMAGES[county] || '/flag.png'} alt={county} className="position-logo" />
                      <CandidateGrid candidates={list} />
                    </div>
                  ))}
              </React.Fragment>
            ))}
          </div>
        )}
        <Footer />
      </div>
      {showConfirmAlert && (
        <div className="custom-alert-overlay">
          <div className="custom-alert info">
            <div className="alert-icon">⚠️</div>
            <p className="alert-message">Note that as soon as you have clicked this button, you won't be able to close this page again until you finish voting.</p>
            <button className="alert-close-btn" onClick={handleConfirmVoting}>I am ready</button>
          </div>
        </div>
      )}
      {showVotingPopup && (
        <VotingPopup
          onClose={() => setShowVotingPopup(false)}
          voterCounty={voter?.county}
          candidates={candidates}
          electionId={ELECTION_ID}
          token={token}
        />
      )}
    </div>
  );
};

export default VotingDashboard;
