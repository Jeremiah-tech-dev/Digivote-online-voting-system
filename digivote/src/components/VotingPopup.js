import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import '../App.css';

const VotingPopup = ({ onClose, voterId }) => {
  const [voterCounty, setVoterCounty] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [votedPositions, setVotedPositions] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    fetchVoterCounty();
  }, []);

  const fetchVoterCounty = async () => {
    try {
      const response = await fetch(`${API_URL}/api/voters/${voterId}`);
      const data = await response.json();
      setVoterCounty(data.county);
    } catch (error) {
      console.error('Error fetching voter county:', error);
    }
  };

  const candidatesData = {
    presidential: [
      { id: 1, name: 'H.E D.R WILLIAM SAMOEI RUTO', image: 'https://i.pinimg.com/736x/bc/2c/c0/bc2cc0013ba2a54a27181bdc2e1123eb.jpg', party: 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg' },
      { id: 2, name: 'H.E RIGATHI GACHAGUA', image: 'https://i.pinimg.com/736x/82/ee/14/82ee1418cddf1aa8cc2bb2589f5894cf.jpg', party: 'https://i.pinimg.com/736x/41/3e/05/413e05f8d2e87807dd306eeae649b659.jpg' },
      { id: 3, name: 'H.E PROF GEORGE WAJACKOYAH', image: 'https://i.pinimg.com/1200x/ac/25/29/ac2529b03a8f363087ff4b34933a993f.jpg', party: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Roots_Party_logo.webp' },
      { id: 4, name: 'H.E JIMI WANJIGI', image: 'https://i.pinimg.com/1200x/32/f3/67/32f36746ccf72f50c601fc71518e830b.jpg', party: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Safina_logo.png/200px-Safina_logo.png' }
    ],
    Nairobi: {
      governors: [
        { id: 5, name: 'H.E JOHNSON SAKAJA', image: 'https://i.pinimg.com/1200x/59/2b/be/592bbe7301b5ddafea58c6a8b5a8e1b1.jpg', party: 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg' },
        { id: 6, name: 'H.E POLYCARP IGATHE', image: 'https://media.licdn.com/dms/image/v2/D4D03AQGxiPQ8q2Bykg/profile-displayphoto-shrink_200_200/B4DZWA4w55GkAY-/0/1741624120104?e=2147483647&v=beta&t=rxSPyLN74oCot4EBXAd8U9oang-1Ue7DnMcvn5hkEgs', party: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg/1200px-Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg.png' }
      ],
      senators: [
        { id: 7, name: 'H.E EDWIN SIFUNA', image: 'https://i.pinimg.com/1200x/8f/6b/81/8f6b811cbe7a45354822842514ff8edf.jpg', party: 'https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg' },
        { id: 8, name: 'H.E KAREN NYAMU', image: 'https://i.pinimg.com/1200x/d3/19/58/d31958b5eba4400181394a560521dc7e.jpg', party: 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg' }
      ]
    },
    Mombasa: {
      governors: [
        { id: 9, name: 'H.E ABDULSWAMAD NASSIR', image: 'https://i.pinimg.com/1200x/2a/f8/e8/2af8e80023afd53d128978d4b383024c.jpg', party: 'https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg' },
        { id: 10, name: 'H.E HASSAN OMAR HASSAN', image: 'https://i.pinimg.com/736x/b0/25/25/b02525da46b879adbaa485df16938fc2.jpg', party: 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg' }
      ],
      senators: [
        { id: 11, name: 'H.E MOHAMED FAKI', image: 'https://publish.eastleighvoice.co.ke/mugera_lock/uploads/2025/02/Faki-Senator.jpg', party: 'https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg' },
        { id: 12, name: 'H.E HAMISI MWAGUYA', image: 'https://brs.go.ke/wp-content/uploads/2025/02/Chairman.png', party: 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg' },
        { id: 13, name: 'H.E ABDULSALAM KASSIM', image: 'https://images.hivisasa.com/1200/VOI31krQoRAbdulsalam.jpg', party: 'https://wiper.co.ke/static/assets/img/wiperlogo.png' }
      ]
    },
    Kisumu: {
      governors: [
        { id: 14, name: 'H.E PROF PETER ANYANG\' NYONG\'O', image: 'https://www.uclga.org/wp-content/uploads/2022/02/Governeur-de-Kisumu-bis.jpg', party: 'https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg' },
        { id: 15, name: 'H.E JACK NYANUNGO RANGUMA', image: 'https://images.hivisasa.com/1200/jcP7Gr2B8pRA.jpg', party: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ8BKCSmmwUKxidQQXq2XjgXrxMGLuDm6jnw&s' }
      ],
      senators: [
        { id: 16, name: 'H.E PROF TOM OJIENDA', image: 'https://thelawyer.africa/wp-content/uploads/2023/09/Ojienda-Full.jpg', party: 'https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg' },
        { id: 17, name: 'H.E ENOS OKOLO', image: 'https://cdgsomaliland.org/wp-content/uploads/2019/12/3.jpg', party: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg/1200px-Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg.png' }
      ]
    },
    Nakuru: {
      governors: [
        { id: 18, name: 'H.E SUSAN KIHIKA', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGYu2ZB1v0EguWDBqm8KqyobAul5-Kf77Mew&s', party: 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg' },
        { id: 19, name: 'H.E LEE KINYANJUI', image: 'https://nakurunews.co.ke/wp-content/uploads/2020/06/lee-kinyanjui-11.jpg', party: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg/1200px-Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg.png' }
      ],
      senators: [
        { id: 20, name: 'H.E TABITHA KARANJA KEROCHE', image: 'https://mzalendo.com/media/member_pics/Tabitha_Karanja.png', party: 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg' },
        { id: 21, name: 'H.E LAWRENCE KARANJA', image: 'https://peopledaily.digital/wp-content/uploads/2020/09/Lawrence-Karanja-.gif', party: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg/1200px-Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg.png' },
        { id: 22, name: 'H.E JOHN MUTUTHO', image: 'https://pbs.twimg.com/profile_images/1543725734/bust_200_400x400.jpg', party: 'https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg' }
      ]
    },
    Eldoret: {
      governors: [
        { id: 23, name: 'H.E JONATHAN BII', image: 'https://uasingishu.go.ke/wp-content/uploads/2023/06/2nd-governor.jpg', party: 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg' },
        { id: 24, name: 'H.E ZEDEKIAH BUNDOTICH (BUZEKI)', image: 'https://cdn.standardmedia.co.ke/images/saturday/votczujcl52evcjox593c2f1d97f3b.jpg', party: 'INDEPENDENT' }
      ],
      senators: [
        { id: 25, name: 'H.E JACKSON MANDAGO', image: 'https://pbs.twimg.com/media/GwoZ26kXkAAFQj9.jpg', party: 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg' },
        { id: 26, name: 'H.E ROBERT ARAP KEMEI', image: 'https://www.uasingishunews.co.ke/wp-content/uploads/2021/12/Arap-kemei.jpg', party: 'INDEPENDENT' }
      ]
    }
  };

  const handleVoteForCandidate = async (position, candidateId, candidateName) => {
    try {
      await fetch(`${API_URL}/api/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: voterId, candidate_id: candidateId })
      });
      
      setVotedPositions(prev => [...prev, position]);
      
      if (position === 'senator') {
        await fetch(`${API_URL}/api/voters/${voterId}/mark-voted`, {
          method: 'PUT'
        });
        setShowSuccessAlert(true);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const handleSuccessClose = () => {
    window.location.href = '/';
  };

  const countyCandidates = candidatesData[voterCounty];

  if (showSuccessAlert) {
    return (
      <div className="custom-alert-overlay">
        <div className="custom-alert success">
          <div className="alert-icon">✔️</div>
          <p className="alert-message">You have successfully practiced your democratic right by voting for your leaders. The portal has been now closed.</p>
          <button className="alert-close-btn" onClick={handleSuccessClose}>OK</button>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-popup-overlay">
      <div className="voting-popup">
        <h2>Cast Your Vote</h2>
        <p className="popup-subtitle">Vote for each position step by step</p>

        <div className="voting-sections">
          {currentStep === 0 && (
            <div className="voting-section">
              <h3>Presidential Candidates</h3>
              <div className="voting-candidates-grid">
                {candidatesData.presidential.map(candidate => (
                  <div key={candidate.id} className="voting-candidate-card">
                    <img src={candidate.image} alt={candidate.name} className="voting-candidate-image" />
                    <p className="voting-candidate-name">{candidate.name}</p>
                    <img src={candidate.party} alt="Party" className="voting-party-logo" />
                    <button 
                      className="vote-candidate-btn"
                      onClick={() => handleVoteForCandidate('presidential', candidate.id, candidate.name)}
                    >
                      Vote for this candidate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && countyCandidates && (
            <div className="voting-section">
              <h3>{voterCounty} - Governor Candidates</h3>
              <div className="voting-candidates-grid">
                {countyCandidates.governors.map(candidate => (
                  <div key={candidate.id} className="voting-candidate-card">
                    <img src={candidate.image} alt={candidate.name} className="voting-candidate-image" />
                    <p className="voting-candidate-name">{candidate.name}</p>
                    {candidate.party === 'INDEPENDENT' ? (
                      <p className="voting-party-logo" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', fontSize: '18px', fontWeight: 'bold'}}>INDEPENDENT</p>
                    ) : (
                      <img src={candidate.party} alt="Party" className="voting-party-logo" />
                    )}
                    <button 
                      className="vote-candidate-btn"
                      onClick={() => handleVoteForCandidate('governor', candidate.id, candidate.name)}
                    >
                      Vote for this candidate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && countyCandidates && (
            <div className="voting-section">
              <h3>{voterCounty} - Senator Candidates</h3>
              <div className="voting-candidates-grid">
                {countyCandidates.senators.map(candidate => (
                  <div key={candidate.id} className="voting-candidate-card">
                    <img src={candidate.image} alt={candidate.name} className="voting-candidate-image" />
                    <p className="voting-candidate-name">{candidate.name}</p>
                    {candidate.party === 'INDEPENDENT' ? (
                      <p className="voting-party-logo" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', fontSize: '18px', fontWeight: 'bold'}}>INDEPENDENT</p>
                    ) : (
                      <img src={candidate.party} alt="Party" className="voting-party-logo" />
                    )}
                    <button 
                      className="vote-candidate-btn"
                      onClick={() => handleVoteForCandidate('senator', candidate.id, candidate.name)}
                    >
                      Vote for this candidate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingPopup;
