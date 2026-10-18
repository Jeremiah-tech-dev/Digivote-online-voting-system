import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';

const ACTION_LABELS = {
  voter_login: 'Voter logged in',
  voter_login_failed: 'Failed voter login',
  ballot_cast: 'Ballot cast',
  admin_login: 'Admin logged in',
  admin_login_failed: 'Failed admin login',
  election_status_changed: 'Election status changed',
  candidate_created: 'Candidate added',
  candidate_updated: 'Candidate edited',
  candidate_deleted: 'Candidate removed'
};

const AuditLogPanel = ({ token }) => {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest('/admin/audit-log', { token });
        setEntries(data.entries);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token]);

  return (
    <div className="admin-panel viz-card">
      <p className="panel-meta">
        The latest 200 security events. Ballot entries show that a voter voted, never who they voted for.
      </p>
      {error && <p className="admin-error">{error}</p>}
      <div className="table-scroll">
      <table className="results-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>By</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id} className={entry.action.endsWith('_failed') ? 'row-warning' : ''}>
              {/* Server times are UTC without a zone marker */}
              <td>{new Date(`${entry.created_at}Z`).toLocaleString()}</td>
              <td>{ACTION_LABELS[entry.action] || entry.action}</td>
              <td>{entry.actor ? `${entry.actor} (${entry.actor_type})` : entry.actor_type}</td>
              <td>{entry.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default AuditLogPanel;
