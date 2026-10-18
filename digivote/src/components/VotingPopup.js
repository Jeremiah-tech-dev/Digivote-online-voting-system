import React, { useState } from 'react';
import { apiRequest } from '../api';
import { PartyLogo, displayName, groupCandidates, showFallbackImage } from '../candidates';
import '../App.css';

const REVIEW_STEP = 3;

const VotingPopup = ({ voterCounty, candidates, electionId, token, onFinished }) => {
  const [currentStep, setCurrentStep] = useState(0);
  // The voter's choice for each position: { presidential: {id, name}, governor: ..., senator: ... }
  const [selections, setSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [receiptCode, setReceiptCode] = useState(null);

  const grouped = groupCandidates(candidates);
  const countyCandidates = grouped.counties[voterCounty];

  // Each step: which position it is for, its heading, and the candidates to choose from
  const steps = [
    { position: 'presidential', title: 'Presidential Candidates', list: grouped.presidential },
    { position: 'governor', title: `${voterCounty} - Governor Candidates`, list: countyCandidates?.governors || [] },
    { position: 'senator', title: `${voterCounty} - Senator Candidates`, list: countyCandidates?.senators || [] }
  ];

  // Choosing a candidate only records the choice locally and moves to the next step.
  // Nothing is sent to the server until the voter confirms the whole ballot.
  const handleVoteForCandidate = (position, candidateId, candidateName) => {
    setSelections(prev => ({ ...prev, [position]: { id: candidateId, name: candidateName } }));
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmitBallot = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const data = await apiRequest('/votes', {
        method: 'POST',
        token,
        body: {
          election_id: electionId,
          presidential_id: selections.presidential.id,
          governor_id: selections.governor.id,
          senator_id: selections.senator.id
        }
      });
      setReceiptCode(data.receipt_code);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };


  if (receiptCode) {
    return (
      <div className="custom-alert-overlay">
        <div className="custom-alert success">
          <div className="alert-icon">✔️</div>
          <p className="alert-message">You have successfully practiced your democratic right by voting for your leaders. The portal has been now closed.</p>
          <p className="receipt-label">Your ballot receipt code</p>
          <p className="receipt-code">{receiptCode}</p>
          <p className="receipt-help">
            Write this code down. You can use "Check ballot receipt" on the home page to confirm your
            ballot was counted. The code does not show who you voted for.
          </p>
          <button className="alert-close-btn" onClick={onFinished}>OK</button>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <div className="voting-popup-overlay">
      <div className="voting-popup">
        <h2>Cast Your Vote</h2>
        <p className="popup-subtitle">Vote for each position step by step</p>

        <div className="voting-sections">
          {step && (
            <div className="voting-section">
              <h3>{step.title}</h3>
              {step.list.length === 0 && (
                <p className="ballot-error">There are no candidates for this position yet. Please contact the election officials.</p>
              )}
              <div className="voting-candidates-grid">
                {step.list.map(candidate => (
                  <div key={candidate.id} className="voting-candidate-card">
                    <img src={candidate.image_url || '/logo.png'} alt={displayName(candidate)} className="voting-candidate-image" onError={showFallbackImage} />
                    <p className="voting-candidate-name">{displayName(candidate)}</p>
                    <PartyLogo candidate={candidate} className="voting-party-logo" />
                    <button
                      className="vote-candidate-btn"
                      onClick={() => handleVoteForCandidate(step.position, candidate.id, displayName(candidate))}
                    >
                      Vote for this candidate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === REVIEW_STEP && (
            <div className="voting-section">
              <h3>Review Your Ballot</h3>
              <p className="popup-subtitle">Your vote cannot be changed after you submit it.</p>
              <ul className="ballot-review-list">
                <li><span>President</span><strong>{selections.presidential?.name}</strong></li>
                <li><span>{voterCounty} Governor</span><strong>{selections.governor?.name}</strong></li>
                <li><span>{voterCounty} Senator</span><strong>{selections.senator?.name}</strong></li>
              </ul>
              {submitError && <p className="ballot-error">{submitError}</p>}
              <div className="ballot-review-actions">
                <button
                  className="ballot-change-btn"
                  onClick={() => setCurrentStep(0)}
                  disabled={submitting}
                >
                  Change my choices
                </button>
                <button
                  className="vote-candidate-btn"
                  onClick={handleSubmitBallot}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit my ballot'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingPopup;
