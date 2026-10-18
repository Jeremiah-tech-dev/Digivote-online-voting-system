import React, { useState } from 'react';
import CustomAlert from './CustomAlert';
import { apiRequest } from '../api';
import '../App.css';

const LoginForm = ({ onClose, onLoginSuccess, onRegisterClick }) => {
  const [formData, setFormData] = useState({
    nationalId: '',
    password: ''
  });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await apiRequest('/login', { method: 'POST', body: formData });
      setAlert({ message: 'Login successful!', type: 'success' });
      setTimeout(() => onLoginSuccess(data.voter, data.access_token), 1500);
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
        <h2>Login to Vote</h2>
        <p className="login-subtitle">Enter your credentials to access the voting portal</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>National ID Number <span className="required">*</span></label>
            <input
              type="text"
              name="nationalId"
              placeholder="Enter your National ID Number"
              value={formData.nationalId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account?</p>
          <button className="register-link-btn" onClick={onRegisterClick}>
            Register as a Voter
          </button>
        </div>
      </div>

      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
    </div>
  );
};

export default LoginForm;
