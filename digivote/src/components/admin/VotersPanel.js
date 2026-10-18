import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';

const VotersPanel = ({ token }) => {
  const [voters, setVoters] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest('/voters', { token });
        setVoters(data.voters);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token]);

  const term = search.trim().toLowerCase();
  const filtered = term
    ? voters.filter(v =>
        `${v.first_name} ${v.last_name} ${v.national_id_number} ${v.county} ${v.constituency}`.toLowerCase().includes(term))
    : voters;

  return (
    <div className="admin-panel viz-card">
      <div className="panel-toolbar">
        <input
          className="panel-search"
          type="search"
          placeholder="Search by name, ID, county or constituency"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="panel-meta">{filtered.length} of {voters.length} voters</span>
      </div>
      {error && <p className="admin-error">{error}</p>}
      <div className="table-scroll">
      <table className="results-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>National ID</th>
            <th>County</th>
            <th>Constituency / Ward</th>
            <th>Voted</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(voter => (
            <tr key={voter.id}>
              <td>{voter.first_name} {voter.last_name}</td>
              <td>{voter.national_id_number}</td>
              <td>{voter.county}</td>
              <td>{voter.constituency} / {voter.ward}</td>
              <td>{voter.has_voted ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default VotersPanel;
