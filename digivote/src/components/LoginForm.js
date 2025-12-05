import React, { useState } from 'react';
import CustomAlert from './CustomAlert';
import { API_URL } from '../config';
import '../App.css';

const LoginForm = ({ onClose, onLoginSuccess, onRegisterClick }) => {
  const [formData, setFormData] = useState({
    nationalId: '',
    password: ''
  });
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAlert({ message: 'Login successful!', type: 'success' });
        setTimeout(() => onLoginSuccess(data.voter), 1500);
      } else {
        setAlert({ message: data.error || 'Login failed', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Error connecting to server', type: 'error' });
      console.error(error);
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

          <button type="submit" className="login-btn">Login</button>
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
