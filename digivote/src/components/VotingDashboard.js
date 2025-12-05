import React, { useState, useEffect } from 'react';
import { FaChartBar, FaVoteYea, FaUsers, FaCheckCircle, FaTachometerAlt, FaClipboardList, FaUserFriends, FaBriefcase, FaUserTie } from 'react-icons/fa';
import Footer from '../Footer';
import VotingPopup from './VotingPopup';
import { API_URL } from '../config';
import '../App.css';

const VotingDashboard = ({ onClose, voterId }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showVotingPopup, setShowVotingPopup] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [stats, setStats] = useState({
    positions: 11,
    candidates: 33,
    totalVoters: 0,
    votersVoted: 0
  });

  useEffect(() => {
    fetchStats();
    checkVotingStatus();
  }, []);

  const fetchStats = async () => {
    try {
      const votersRes = await fetch(`${API_URL}/api/voters`);
      const votersData = await votersRes.json();
      
      setStats(prev => ({
        ...prev,
        totalVoters: votersData.count
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkVotingStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/voters/${voterId}`);
      const data = await response.json();
      setHasVoted(data.has_voted === 1);
    } catch (error) {
      console.error('Error checking voting status:', error);
    }
  };

  const handleVoteNowClick = () => {
    if (hasVoted) {
      alert('You have already voted in this election.');
      return;
    }
    setShowConfirmAlert(true);
  };

  const handleConfirmVoting = () => {
    setShowConfirmAlert(false);
    setShowVotingPopup(true);
  };

  const summaryCards = [
    { title: 'No. of Positions', value: stats.positions, icon: FaBriefcase, color: 'blue' },
    { title: 'No. of Candidates', value: stats.candidates, icon: FaUserTie, color: 'green' },
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
                    <p><strong>Election Type:</strong> General Election 2025</p>
                    <p><strong>Your Status:</strong> Registered & Eligible to Vote</p>
                    <p><strong>Positions Available:</strong> {stats.positions} positions to vote for</p>
                    <p><strong>Total Candidates:</strong> {stats.candidates} candidates running</p>
                  </div>
                </div>

                <div className="election-info-right">
                  <h2>How to Vote</h2>
                  <ol className="voting-steps">
                    <li>Review all positions and candidates</li>
                    <li>Select your preferred candidate for each position</li>
                    <li>Review your choices before submitting</li>
                    <li>Submit your vote securely</li>
                  </ol>
                </div>
              </div>

              <button className="start-voting-btn" onClick={handleVoteNowClick}>
                Vote Now
              </button>
            </div>
          </div>
        )}

        {activeMenu === 'votes' && (
          <div className="dashboard-content">
            <h2>Your Voting History</h2>
            <p>View your past votes and election participation.</p>
          </div>
        )}

        {activeMenu === 'positions' && (
          <div className="dashboard-content">
            <h2>Available Positions</h2>
            <p className="positions-subtitle">Select positions to view candidates and cast your vote</p>
            
            <div className="positions-list">
              <div className="position-card presidential">
                <img src="/kenyanl.webp" alt="Kenya" className="presidential-flag" />
                <div className="presidential-content">
                  <h3>Presidential</h3>
                </div>
                <img src="/kenyan.avif" alt="Kenya Flag" className="presidential-flag" />
              </div>

              <div className="city-positions">
                <h3 className="city-header">Nairobi City</h3>
                <div className="position-card">
                  <div>
                    <h4>Governor - Nairobi City</h4>
                    <p>Vote for Nairobi City Governor</p>
                  </div>
                  <img src="/Nairobi.jpeg" alt="Nairobi" className="city-image" />
                </div>
                <div className="position-card">
                  <div>
                    <h4>Senator - Nairobi City</h4>
                    <p>Vote for Nairobi City Senator</p>
                  </div>
                  <img src="/Nairobi.jpeg" alt="Nairobi" className="city-image" />
                </div>
              </div>

              <div className="city-positions">
                <h3 className="city-header">Mombasa City</h3>
                <div className="position-card">
                  <div>
                    <h4>Governor - Mombasa City</h4>
                    <p>Vote for Mombasa City Governor</p>
                  </div>
                  <img src="/mombasa.png" alt="Mombasa" className="city-image mombasa-image" />
                </div>
                <div className="position-card">
                  <div>
                    <h4>Senator - Mombasa City</h4>
                    <p>Vote for Mombasa City Senator</p>
                  </div>
                  <img src="/mombasa.png" alt="Mombasa" className="city-image mombasa-image" />
                </div>
              </div>

              <div className="city-positions">
                <h3 className="city-header">Kisumu City</h3>
                <div className="position-card">
                  <div>
                    <h4>Governor - Kisumu City</h4>
                    <p>Vote for Kisumu City Governor</p>
                  </div>
                  <img src="/kisumu.webp" alt="Kisumu" className="city-image mombasa-image" />
                </div>
                <div className="position-card">
                  <div>
                    <h4>Senator - Kisumu City</h4>
                    <p>Vote for Kisumu City Senator</p>
                  </div>
                  <img src="/kisumu.webp" alt="Kisumu" className="city-image mombasa-image" />
                </div>
              </div>

              <div className="city-positions">
                <h3 className="city-header">Nakuru City</h3>
                <div className="position-card">
                  <div>
                    <h4>Governor - Nakuru City</h4>
                    <p>Vote for Nakuru City Governor</p>
                  </div>
                  <img src="/nakuru.png" alt="Nakuru" className="city-image mombasa-image" />
                </div>
                <div className="position-card">
                  <div>
                    <h4>Senator - Nakuru City</h4>
                    <p>Vote for Nakuru City Senator</p>
                  </div>
                  <img src="/nakuru.png" alt="Nakuru" className="city-image mombasa-image" />
                </div>
              </div>

              <div className="city-positions">
                <h3 className="city-header">Eldoret City</h3>
                <div className="position-card">
                  <div>
                    <h4>Governor - Eldoret City</h4>
                    <p>Vote for Eldoret City Governor</p>
                  </div>
                  <img src="/eldoret.png" alt="Eldoret" className="city-image mombasa-image" />
                </div>
                <div className="position-card">
                  <div>
                    <h4>Senator - Eldoret City</h4>
                    <p>Vote for Eldoret City Senator</p>
                  </div>
                  <img src="/eldoret.png" alt="Eldoret" className="city-image mombasa-image" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'candidates' && (
          <div className="dashboard-content">
            <h2>All Candidates</h2>
            <p className="candidates-subtitle">Review all candidates running for various positions</p>
            
            <div className="candidates-section">
              <h3 className="candidates-position-title">Presidential Candidates</h3>
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://i.pinimg.com/736x/bc/2c/c0/bc2cc0013ba2a54a27181bdc2e1123eb.jpg" alt="William Ruto" className="candidate-image" />
                  <p className="candidate-name">H.E D.R WILLIAM SAMOEI RUTO</p>
                  <img src="https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://i.pinimg.com/736x/82/ee/14/82ee1418cddf1aa8cc2bb2589f5894cf.jpg" alt="Rigathi Gachagua" className="candidate-image" />
                  <p className="candidate-name">H.E RIGATHI GACHAGUA</p>
                  <img src="https://i.pinimg.com/736x/41/3e/05/413e05f8d2e87807dd306eeae649b659.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://i.pinimg.com/1200x/ac/25/29/ac2529b03a8f363087ff4b34933a993f.jpg" alt="George Wajackoyah" className="candidate-image" />
                  <p className="candidate-name">H.E PROF GEORGE WAJACKOYAH</p>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Roots_Party_logo.webp" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://i.pinimg.com/1200x/32/f3/67/32f36746ccf72f50c601fc71518e830b.jpg" alt="Jimi Wanjigi" className="candidate-image" />
                  <p className="candidate-name">H.E JIMI WANJIGI</p>
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Safina_logo.png/200px-Safina_logo.png" alt="Party Logo" className="party-logo" />
                </div>
              </div>
              <img src="/kenyan.avif" alt="Kenya Flag" className="position-logo" />
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Nairobi City - Governors</h3>
              <img src="/Nairobi.jpeg" alt="Nairobi" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://i.pinimg.com/1200x/59/2b/be/592bbe7301b5ddafea58c6a8b5a8e1b1.jpg" alt="Johnson Sakaja" className="candidate-image" />
                  <p className="candidate-name">H.E JOHNSON SAKAJA</p>
                  <img src="https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://media.licdn.com/dms/image/v2/D4D03AQGxiPQ8q2Bykg/profile-displayphoto-shrink_200_200/B4DZWA4w55GkAY-/0/1741624120104?e=2147483647&v=beta&t=rxSPyLN74oCot4EBXAd8U9oang-1Ue7DnMcvn5hkEgs" alt="Polycarp Igathe" className="candidate-image" />
                  <p className="candidate-name">H.E POLYCARP IGATHE</p>
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg/1200px-Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg.png" alt="Party Logo" className="party-logo" />
                </div>
              </div>
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Nairobi City - Senators</h3>
              <img src="/Nairobi.jpeg" alt="Nairobi" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://i.pinimg.com/1200x/8f/6b/81/8f6b811cbe7a45354822842514ff8edf.jpg" alt="Edwin Sifuna" className="candidate-image" />
                  <p className="candidate-name">H.E EDWIN SIFUNA</p>
                  <img src="https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://i.pinimg.com/1200x/d3/19/58/d31958b5eba4400181394a560521dc7e.jpg" alt="Karen Nyamu" className="candidate-image" />
                  <p className="candidate-name">H.E KAREN NYAMU</p>
                  <img src="https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg" alt="Party Logo" className="party-logo" />
                </div>
              </div>
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Mombasa City - Governors</h3>
              <img src="/mombasa.png" alt="Mombasa" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://i.pinimg.com/1200x/2a/f8/e8/2af8e80023afd53d128978d4b383024c.jpg" alt="Abdulswamad Nassir" className="candidate-image" />
                  <p className="candidate-name">H.E ABDULSWAMAD NASSIR</p>
                  <img src="https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://i.pinimg.com/736x/b0/25/25/b02525da46b879adbaa485df16938fc2.jpg" alt="Hassan Omar Hassan" className="candidate-image" />
                  <p className="candidate-name">H.E HASSAN OMAR HASSAN</p>
                  <img src="https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg" alt="Party Logo" className="party-logo" />
                </div>
              </div>
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Mombasa City - Senators</h3>
              <img src="/mombasa.png" alt="Mombasa" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://publish.eastleighvoice.co.ke/mugera_lock/uploads/2025/02/Faki-Senator.jpg" alt="Mohamed Faki" className="candidate-image" />
                  <p className="candidate-name">H.E MOHAMED FAKI</p>
                  <img src="https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://brs.go.ke/wp-content/uploads/2025/02/Chairman.png" alt="Hamisi Mwaguya" className="candidate-image" />
                  <p className="candidate-name">H.E HAMISI MWAGUYA</p>
                  <img src="https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://images.hivisasa.com/1200/VOI31krQoRAbdulsalam.jpg" alt="Abdulsalam Kassim" className="candidate-image" />
                  <p className="candidate-name">H.E ABDULSALAM KASSIM</p>
                  <img src="https://wiper.co.ke/static/assets/img/wiperlogo.png" alt="Party Logo" className="party-logo" />
                </div>
              </div>
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Kisumu City - Governors</h3>
              <img src="/kisumu.webp" alt="Kisumu" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://www.uclga.org/wp-content/uploads/2022/02/Governeur-de-Kisumu-bis.jpg" alt="Peter Anyang' Nyong'o" className="candidate-image" />
                  <p className="candidate-name">H.E PROF PETER ANYANG' NYONG'O</p>
                  <img src="https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://images.hivisasa.com/1200/jcP7Gr2B8pRA.jpg" alt="Jack Nyanungo Ranguma" className="candidate-image" />
                  <p className="candidate-name">H.E JACK NYANUNGO RANGUMA</p>
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ8BKCSmmwUKxidQQXq2XjgXrxMGLuDm6jnw&s" alt="Party Logo" className="party-logo" />
                </div>
              </div>
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Kisumu City - Senators</h3>
              <img src="/kisumu.webp" alt="Kisumu" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://thelawyer.africa/wp-content/uploads/2023/09/Ojienda-Full.jpg" alt="Tom Ojienda" className="candidate-image" />
                  <p className="candidate-name">H.E PROF TOM OJIENDA</p>
                  <img src="https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://cdgsomaliland.org/wp-content/uploads/2019/12/3.jpg" alt="Enos Okolo" className="candidate-image" />
                  <p className="candidate-name">H.E ENOS OKOLO</p>
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg/1200px-Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg.png" alt="Party Logo" className="party-logo" />
                </div>
              </div>
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Nakuru City - Governors</h3>
              <img src="/nakuru.png" alt="Nakuru" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGYu2ZB1v0EguWDBqm8KqyobAul5-Kf77Mew&s" alt="Susan Kihika" className="candidate-image" />
                  <p className="candidate-name">H.E SUSAN KIHIKA</p>
                  <img src="https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://nakurunews.co.ke/wp-content/uploads/2020/06/lee-kinyanjui-11.jpg" alt="Lee Kinyanjui" className="candidate-image" />
                  <p className="candidate-name">H.E LEE KINYANJUI</p>
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg/1200px-Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg.png" alt="Party Logo" className="party-logo" />
                </div>
              </div>
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Nakuru City - Senators</h3>
              <img src="/nakuru.png" alt="Nakuru" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://mzalendo.com/media/member_pics/Tabitha_Karanja.png" alt="Tabitha Karanja Keroche" className="candidate-image" />
                  <p className="candidate-name">H.E TABITHA KARANJA KEROCHE</p>
                  <img src="https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://peopledaily.digital/wp-content/uploads/2020/09/Lawrence-Karanja-.gif" alt="Lawrence Karanja" className="candidate-image" />
                  <p className="candidate-name">H.E LAWRENCE KARANJA</p>
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg/1200px-Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg.png" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://pbs.twimg.com/profile_images/1543725734/bust_200_400x400.jpg" alt="John Mututho" className="candidate-image" />
                  <p className="candidate-name">H.E JOHN MUTUTHO</p>
                  <img src="https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg" alt="Party Logo" className="party-logo" />
                </div>
              </div>
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Eldoret City - Governors</h3>
              <img src="/eldoret.png" alt="Eldoret" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://uasingishu.go.ke/wp-content/uploads/2023/06/2nd-governor.jpg" alt="Jonathan Bii" className="candidate-image" />
                  <p className="candidate-name">H.E JONATHAN BII</p>
                  <img src="https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://cdn.standardmedia.co.ke/images/saturday/votczujcl52evcjox593c2f1d97f3b.jpg" alt="Zedekiah Bundotich" className="candidate-image" />
                  <p className="candidate-name">H.E ZEDEKIAH BUNDOTICH (BUZEKI)</p>
                  <p className="party-logo" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '130px', fontSize: '24px', fontWeight: 'bold', color: '#333'}}>INDEPENDENT</p>
                </div>
              </div>
            </div>

            <div className="candidates-section">
              <h3 className="candidates-position-title">Eldoret City - Senators</h3>
              <img src="/eldoret.png" alt="Eldoret" className="position-logo" />
              <div className="candidates-grid">
                <div className="candidate-card">
                  <img src="https://pbs.twimg.com/media/GwoZ26kXkAAFQj9.jpg" alt="Jackson Mandago" className="candidate-image" />
                  <p className="candidate-name">H.E JACKSON MANDAGO</p>
                  <img src="https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg" alt="Party Logo" className="party-logo" />
                </div>
                <div className="candidate-card">
                  <img src="https://www.uasingishunews.co.ke/wp-content/uploads/2021/12/Arap-kemei.jpg" alt="Robert Arap Kemei" className="candidate-image" />
                  <p className="candidate-name">H.E ROBERT ARAP KEMEI</p>
                  <p className="party-logo" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '130px', fontSize: '24px', fontWeight: 'bold', color: '#333'}}>INDEPENDENT</p>
                </div>
              </div>
            </div>
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
      {showVotingPopup && <VotingPopup onClose={() => setShowVotingPopup(false)} voterId={voterId} />}
    </div>
  );
};

export default VotingDashboard;
