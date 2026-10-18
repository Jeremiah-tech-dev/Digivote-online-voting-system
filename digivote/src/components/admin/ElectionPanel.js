import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { apiRequest } from '../../api';

const LIFECYCLE = [
  { status: 'upcoming', label: 'Upcoming', info: 'Voting has not started. Candidates can still be added, edited or removed.' },
  { status: 'active', label: 'Voting open', info: 'Registered voters can log in and cast their ballots.' },
  { status: 'closed', label: 'Closed', info: 'Voting has ended. Results are final and can no longer change.' }
];

// The actions an admin can take from each status (mirrors the rules on the server)
const ACTIONS = {
  upcoming: [{ status: 'active', label: 'Open voting', confirm: 'Open voting now? Candidates cannot be changed once someone has voted.' }],
  active: [
    { status: 'closed', label: 'Close voting', confirm: 'Close voting? This is final: the election cannot be reopened.', danger: true },
    { status: 'upcoming', label: 'Move back to upcoming', confirm: 'Move the election back to upcoming? This only works if nobody has voted yet.', secondary: true }
  ],
  closed: []
};

const ElectionPanel = ({ token, election, onElectionChange }) => {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!election) return <div className="viz-loading"><span className="viz-spinner" /> Loading election...</div>;

  const currentIndex = LIFECYCLE.findIndex(s => s.status === election.status);

  const changeStatus = async (action) => {
    if (!window.confirm(action.confirm)) return;
    setBusy(true);
    setError('');
    try {
      const data = await apiRequest(`/admin/elections/${election.id}/status`, {
        method: 'PUT',
        token,
        body: { status: action.status }
      });
      onElectionChange(data.election);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="viz-card">
      <header className="viz-card-header">
        <div>
          <h3>{election.title}</h3>
          <p>{election.description}</p>
        </div>
        <span className={`status-pill status-${election.status}`}>{election.status}</span>
      </header>

      <ol className="lifecycle">
        {LIFECYCLE.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo';
          return (
            <li key={step.status} className={`lifecycle-step ${state}`}>
              <span className="lifecycle-marker">{state === 'done' ? <FaCheck /> : index + 1}</span>
              <span className="lifecycle-label">{step.label}</span>
            </li>
          );
        })}
      </ol>

      <p className="lifecycle-info">{LIFECYCLE[currentIndex]?.info}</p>

      <div className="election-actions">
        {ACTIONS[election.status].map(action => (
          <button
            key={action.status}
            className={`admin-action-btn${action.danger ? ' danger' : ''}${action.secondary ? ' secondary' : ''}`}
            onClick={() => changeStatus(action)}
            disabled={busy}
          >
            {action.label}
          </button>
        ))}
      </div>
      {error && <p className="admin-error">{error}</p>}
    </section>
  );
};

export default ElectionPanel;
