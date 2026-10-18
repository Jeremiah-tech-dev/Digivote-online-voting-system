import React, { useState, useEffect } from 'react';
import { FaChartPie, FaFlag, FaUserTie, FaUsers, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
import { apiRequest } from '../api';
import ResultsPanel from './admin/ResultsPanel';
import ElectionPanel from './admin/ElectionPanel';
import CandidatesPanel from './admin/CandidatesPanel';
import VotersPanel from './admin/VotersPanel';
import AuditLogPanel from './admin/AuditLogPanel';
import './admin/admin.css';

const ELECTION_ID = 1;

const TABS = [
  { id: 'results', label: 'Live Results', icon: FaChartPie, title: 'Live Results', subtitle: 'Real-time vote counts and turnout' },
  { id: 'election', label: 'Election', icon: FaFlag, title: 'Election Control', subtitle: 'Open and close voting' },
  { id: 'candidates', label: 'Candidates', icon: FaUserTie, title: 'Candidates', subtitle: 'Manage who appears on the ballot' },
  { id: 'voters', label: 'Voters', icon: FaUsers, title: 'Registered Voters', subtitle: 'Everyone registered for this election' },
  { id: 'audit', label: 'Audit Log', icon: FaClipboardList, title: 'Audit Log', subtitle: 'Security events and admin actions' }
];

const AdminDashboard = ({ onClose, token }) => {
  const [activeTab, setActiveTab] = useState('results');
  const [election, setElection] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadElection = async () => {
      try {
        const data = await apiRequest('/elections');
        setElection(data.elections.find(e => e.id === ELECTION_ID) || null);
      } catch (err) {
        setError(err.message);
      }
    };
    loadElection();
  }, []);

  const tab = TABS.find(t => t.id === activeTab);

  return (
    <div className="admin-portal">
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <img src="/IEBC.png" alt="IEBC Logo" />
          <div>
            <strong>Digivote</strong>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="portal-nav" role="tablist" aria-label="Admin sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              className={activeTab === id ? 'active' : ''}
              onClick={() => setActiveTab(id)}
            >
              <Icon /> <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="portal-logout" onClick={onClose}>
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <div>
            <h1>{tab.title}</h1>
            <p>{tab.subtitle}</p>
          </div>
          {election && (
            <div className="portal-election">
              <span className="portal-election-title">{election.title}</span>
              <span className={`status-pill status-${election.status}`}>{election.status}</span>
            </div>
          )}
        </header>

        <div className="portal-content">
          {error && <p className="admin-error">{error}</p>}
          {activeTab === 'results' && <ResultsPanel token={token} />}
          {activeTab === 'election' && <ElectionPanel token={token} election={election} onElectionChange={setElection} />}
          {activeTab === 'candidates' && <CandidatesPanel token={token} election={election} />}
          {activeTab === 'voters' && <VotersPanel token={token} />}
          {activeTab === 'audit' && <AuditLogPanel token={token} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
