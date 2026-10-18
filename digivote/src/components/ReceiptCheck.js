import React, { useState } from 'react';
import CustomAlert from './CustomAlert';
import { apiRequest } from '../api';
import '../App.css';

const ReceiptCheck = ({ onClose }) => {
  const [code, setCode] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest(`/receipts/${encodeURIComponent(code.trim())}`);
      setAlert({
        message: `Your ballot was counted.\n\nElection: ${data.election}\nPositions recorded: ${data.positions_recorded.join(', ')}`,
        type: 'success'
      });
    } catch (error) {
      setAlert({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-modal">
      <div className="login-form-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <img src="/IEBC.png" alt="IEBC Logo" className="login-logo" />
        <h2>Check Ballot Receipt</h2>
        <p className="login-subtitle">
          Enter the receipt code you received after voting to confirm your ballot was counted.
          For your privacy, this does not show who you voted for.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Receipt Code <span className="required">*</span></label>
            <input
              type="text"
              placeholder="e.g. K7Q2-M9XD-4TPA"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={20}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Check Receipt'}
          </button>
        </form>
      </div>

      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
    </div>
  );
};

export default ReceiptCheck;
