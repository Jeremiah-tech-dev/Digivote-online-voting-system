import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../api';
import { COUNTIES, POSITIONS, showFallbackImage } from '../../candidates';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  party: '',
  position: 'Presidential',
  county: '',
  image_url: '',
  party_logo_url: ''
};

const CandidatesPanel = ({ token, election }) => {
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const electionId = election?.id;

  const loadCandidates = useCallback(async () => {
    if (!electionId) return;
    try {
      const data = await apiRequest(`/elections/${electionId}/candidates`);
      setCandidates(data.candidates);
    } catch (err) {
      setError(err.message);
    }
  }, [electionId]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  if (!election) return <div className="viz-loading"><span className="viz-spinner" /> Loading candidates...</div>;

  const locked = election.status !== 'upcoming';

  const openNewForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (candidate) => {
    setForm({
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      party: candidate.party,
      position: candidate.position,
      county: candidate.county || '',
      image_url: candidate.image_url || '',
      party_logo_url: candidate.party_logo_url || ''
    });
    setEditingId(candidate.id);
    setShowForm(true);
    setError('');
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editingId) {
        await apiRequest(`/admin/candidates/${editingId}`, { method: 'PUT', token, body: form });
      } else {
        await apiRequest(`/admin/elections/${election.id}/candidates`, { method: 'POST', token, body: form });
      }
      setShowForm(false);
      await loadCandidates();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (candidate) => {
    if (!window.confirm(`Remove ${candidate.first_name} ${candidate.last_name} from the ballot?`)) return;
    setError('');
    try {
      await apiRequest(`/admin/candidates/${candidate.id}`, { method: 'DELETE', token });
      await loadCandidates();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-panel viz-card">
      <div className="panel-toolbar">
        <p className="panel-meta">
          {locked
            ? 'Candidates can only be changed while the election is upcoming.'
            : `${candidates.length} candidates on the ballot.`}
        </p>
        {!locked && <button className="admin-action-btn" onClick={openNewForm}>Add candidate</button>}
      </div>

      {error && <p className="admin-error">{error}</p>}

      {showForm && !locked && (
        <form className="candidate-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit candidate' : 'Add candidate'}</h3>
          <div className="candidate-form-grid">
            <label>First name<input name="first_name" value={form.first_name} onChange={handleChange} required /></label>
            <label>Last name<input name="last_name" value={form.last_name} onChange={handleChange} required /></label>
            <label>Party<input name="party" value={form.party} onChange={handleChange} required /></label>
            <label>Position
              <select name="position" value={form.position} onChange={handleChange}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            {form.position !== 'Presidential' && (
              <label>County
                <select name="county" value={form.county} onChange={handleChange} required>
                  <option value="">Select county</option>
                  {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            )}
            <label>Photo link (optional)<input name="image_url" type="url" value={form.image_url} onChange={handleChange} placeholder="https://..." /></label>
            <label>Party logo link (optional)<input name="party_logo_url" type="url" value={form.party_logo_url} onChange={handleChange} placeholder="https://..." /></label>
          </div>
          <div className="election-actions">
            <button type="submit" className="admin-action-btn" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
            <button type="button" className="admin-action-btn secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-scroll">
      <table className="results-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Party</th>
            <th>Position</th>
            {!locked && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.id}>
              <td>
                <span className="person-cell">
                  <img src={candidate.image_url || '/logo.png'} alt="" className="avatar" onError={showFallbackImage} />
                  {candidate.first_name} {candidate.last_name}
                </span>
              </td>
              <td>{candidate.party}</td>
              <td>{candidate.county ? `${candidate.county} ${candidate.position}` : candidate.position}</td>
              {!locked && (
                <td className="table-actions">
                  <button className="link-btn" onClick={() => openEditForm(candidate)}>Edit</button>
                  <button className="link-btn danger" onClick={() => handleDelete(candidate)}>Remove</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default CandidatesPanel;
