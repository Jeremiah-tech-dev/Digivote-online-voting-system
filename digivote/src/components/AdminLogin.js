import React, { useState } from 'react';
import '../App.css';

const AdminLogin = ({ onClose, onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'admin2025') {
      onLoginSuccess();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-box">
        <button className="admin-login-close" onClick={onClose}>&times;</button>
        <img src="/IEBC.png" alt="IEBC Logo" className="admin-login-logo" />
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="admin-form-group">
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
