import React, { useState } from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaTiktok, FaInstagram, FaYoutube } from 'react-icons/fa';
import { MdHowToVote } from 'react-icons/md';
import RegisterVoter from './components/RegisterVoter';
import VerifyVoter from './components/VerifyVoter';
import LoginForm from './components/LoginForm';
import VotingDashboard from './components/VotingDashboard';
import './App.css';

const Navbar = () => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showVotingDashboard, setShowVotingDashboard] = useState(false);
  const [loggedInVoter, setLoggedInVoter] = useState(null);

  const openModal = (type) => {
    setModalContent(type);
    setAboutOpen(false);
    setRegistrationOpen(false);
    setMediaOpen(false);
    setWorkOpen(false);
  };

  const closeModal = () => setModalContent(null);

  return (
    <header className="header-container">
      {/* Top Black Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <span className="msg-icon">💬</span>
          <span className="msg-text">REBUILD & RESTORE OUR VOICE FOR POSITIVE CHANGE</span>
        </div>
        <div className="social-icons">
          <a href="https://twitter.com/IEBCKenya" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          <a href="https://www.facebook.com/IEBCKenya" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="https://www.linkedin.com/company/iebckenya" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
          <a href="https://bit.ly/44QCPN2" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
          <a href="https://www.tiktok.com/@iebckenya" target="_blank" rel="noopener noreferrer"><FaTiktok /></a>
          <a href="https://www.instagram.com/iebckenya" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="https://www.youtube.com/iebcpage" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="logo-section">
          <div className="logo-box">
            <img src="/IEBC.png" alt="IEBC Logo" className="logo-img" />
          </div>
        </div>

        <ul className="nav-links">
          <li className="active">HOME</li>
          <li className="dropdown" onClick={() => setAboutOpen(!aboutOpen)}>
            ABOUT <span>⌄</span>
            {aboutOpen && (
              <ul className="dropdown-menu">
                <li onClick={(e) => { e.stopPropagation(); openModal('vision'); }}>Our Vision</li>
                <li onClick={(e) => { e.stopPropagation(); openModal('mission'); }}>Our Mission</li>
                <li onClick={(e) => { e.stopPropagation(); openModal('values'); }}>Core Values</li>
              </ul>
            )}
          </li>
          <li className="dropdown" onClick={() => setRegistrationOpen(!registrationOpen)}>
            REGISTRATION <span>⌄</span>
            {registrationOpen && (
              <ul className="dropdown-menu">
                <li onClick={(e) => { e.stopPropagation(); openModal('whyRegister'); }}>Why Register?</li>
                <li onClick={(e) => { e.stopPropagation(); window.location.href = 'https://www.iebc.or.ke/registration/?Statistics_of_Voter_2022'; }}>Statistics of voters 2022</li>
                <li onClick={(e) => { e.stopPropagation(); window.location.href = 'https://www.iebc.or.ke/registration/?aspirant'; }}>Aspirant Requirements</li>
                <li onClick={(e) => { e.stopPropagation(); window.location.href = 'https://www.iebc.or.ke/docs/Physical_Locations_of_Constituency_Offices_in_Kenya_290_Constituencies.pdf'; }}>IEBC Constituency Offices</li>
                <li onClick={(e) => { e.stopPropagation(); window.location.href = 'https://forms.iebc.or.ke/'; }}>Forms portal</li>
                <li onClick={(e) => { e.stopPropagation(); setRegistrationOpen(false); setShowRegisterForm(true); }}>Register as a Voter</li>
                <li onClick={(e) => { e.stopPropagation(); setRegistrationOpen(false); setShowVerifyForm(true); }}>Verify your voting details</li>
                <li onClick={(e) => { e.stopPropagation(); setRegistrationOpen(false); setShowLoginForm(true); }}>Login to voting portal</li>
              </ul>
            )}
          </li>
          <li className="dropdown" onClick={() => setMediaOpen(!mediaOpen)}>
            MEDIA <span>⌄</span>
            {mediaOpen && (
              <ul className="dropdown-menu">
                <li onClick={(e) => { e.stopPropagation(); window.location.href = 'https://www.iebc.or.ke/media/?press'; }}>Press releases</li>
                <li onClick={(e) => { e.stopPropagation(); window.location.href = 'https://www.iebc.or.ke/media/?speeches'; }}>Speeches</li>
                <li onClick={(e) => { e.stopPropagation(); window.location.href = 'https://www.iebc.or.ke/media/?news'; }}>IEBC news</li>
              </ul>
            )}
          </li>
          <li className="dropdown" onClick={() => setWorkOpen(!workOpen)}>
            WORK WITH US <span>⌄</span>
            {workOpen && (
              <ul className="dropdown-menu">
                <li onClick={(e) => { e.stopPropagation(); window.location.href = 'https://jobs.iebc.or.ke/'; }}>Vacancies</li>
                <li onClick={(e) => { e.stopPropagation(); window.location.href = 'https://www.iebc.or.ke/work?tenders'; }}>Tenders</li>
              </ul>
            )}
          </li>
          <li onClick={() => openModal('contact')}>CONTACT</li>
        </ul>

        <div className="menu-trigger">
          <MdHowToVote size={30} />
        </div>
        
        <button className="admin-btn">Admin</button>
      </nav>

      {/* Modal */}
      {modalContent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            {modalContent === 'vision' && (
              <div>
                <h2>Our Vision</h2>
                <p>"A credible electoral management body that meets the democratic aspirations of the people of Kenya."</p>
              </div>
            )}
            {modalContent === 'mission' && (
              <div>
                <h2>Our Mission</h2>
                <p>"To conduct transparent, efficient, and impartial elections; and undertake boundary delimitation for equitable representation and sustainable democracy."</p>
              </div>
            )}
            {modalContent === 'values' && (
              <div>
                <h2>Core Values</h2>
                <ul>
                  <li><strong>Adherence to the rule of law</strong> - We conduct our businesses within the law.</li>
                  <li><strong>Inclusivity</strong> - We respect gender, race, class and disability in the conduct of electoral activities.</li>
                  <li><strong>Integrity</strong> - We conduct our affairs with utmost honesty.</li>
                  <li><strong>Accountability</strong> - We endeavor to be responsible for our actions.</li>
                  <li><strong>Teamwork</strong> - We work collaboratively as colleagues to achieve Commission goals.</li>
                  <li><strong>Innovativeness</strong> - We transform the electoral process by exceeding the expectations of Kenyans.</li>
                </ul>
              </div>
            )}
            {modalContent === 'whyRegister' && (
              <div>
                <h2>Why Register?</h2>
                <ul>
                  <li>It gives you an opportunity to vote and elect leaders of your choice.</li>
                  <li>It allows you to vie for any elective position</li>
                  <li>It allows you to propose or second your preferred candidate for nomination</li>
                  <li>It gives you the right to nominate candidates for elections</li>
                  <li>It gives you moral authority to hold leaders accountable</li>
                </ul>
              </div>
            )}
            {modalContent === 'contact' && (
              <div>
                <h2>Contact Us</h2>
                <p>University Way, Anniversary Towers, 6th Floor</p>
                <p>P.O Box 45371 – 00100, Nairobi</p>
                <p>Tel No: (254) 020 – 2877000</p>
                <p>Email Address: info@iebc.or.ke</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Register Voter Form */}
      {showRegisterForm && <RegisterVoter onClose={() => setShowRegisterForm(false)} />}
      
      {/* Verify Voter Portal */}
      {showVerifyForm && <VerifyVoter onClose={() => setShowVerifyForm(false)} />}
      
      {/* Login Form */}
      {showLoginForm && (
        <LoginForm 
          onClose={() => setShowLoginForm(false)}
          onLoginSuccess={(voter) => {
            setLoggedInVoter(voter);
            setShowLoginForm(false);
            setShowVotingDashboard(true);
          }}
          onRegisterClick={() => {
            setShowLoginForm(false);
            setShowRegisterForm(true);
          }}
        />
      )}
      
      {/* Voting Dashboard */}
      {showVotingDashboard && (
        <VotingDashboard 
          onClose={() => {
            setShowVotingDashboard(false);
            setLoggedInVoter(null);
          }}
          voterId={loggedInVoter?.id}
        />
      )}
    </header>
  );
};

export default Navbar;