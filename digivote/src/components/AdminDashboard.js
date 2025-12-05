import React, { useState, useEffect } from 'react';
import '../App.css';

const AdminDashboard = ({ onClose }) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/results');
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const totalVotes = results.reduce((sum, result) => sum + result.vote_count, 0);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Election Results Dashboard</h1>
        <button className="admin-close-btn" onClick={onClose}>Close</button>
      </div>
      
      <div className="admin-content">
        <div className="total-votes-banner">
          <h2>Total Votes Cast: {totalVotes}</h2>
        </div>
        
        <table className="results-table">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Party</th>
              <th>Position</th>
              <th>Total Votes</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.candidate_name}</td>
                <td>{result.party}</td>
                <td>{result.county ? `${result.county} ${result.position}` : result.position}</td>
                <td className="votes-count">{result.vote_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
