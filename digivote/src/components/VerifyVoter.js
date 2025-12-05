import React, { useState } from 'react';
import Footer from '../Footer';
import CustomAlert from './CustomAlert';
import { API_URL } from '../config';
import '../App.css';

const VerifyVoter = ({ onClose }) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    yearOfBirth: ''
  });
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAlert({
          message: `Verification Successful!\n\nName: ${data.voter.name}\nCounty: ${data.voter.county}\nConstituency: ${data.voter.constituency}\nWard: ${data.voter.ward}\nPolling Station: ${data.voter.polling_station}`,
          type: 'success'
        });
      } else {
        setAlert({ message: data.error || 'Verification failed', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Error connecting to server', type: 'error' });
      console.error(error);
    }
  };

  return (
    <div className="verify-voter-page">
      <div className="verify-navbar">
        <div className="verify-logo">
          <img src="/logo.png" alt="IEBC Logo" className="verify-logo-img" />
          <span>Voter Verification Portal</span>
        </div>
        <div className="verify-nav-links">
          <a href="#" className="active">Home</a>
          <a href="https://www.iebc.or.ke">Our Website</a>
        </div>
        <button className="verify-close" onClick={onClose}>&times;</button>
      </div>

      <div className="verify-banner"></div>

      <div className="verify-container">
        <div className="verify-card">
          <h1>Check your voting particulars Today!</h1>
          <div className="verify-separator"></div>
          <p className="verify-instruction">* Indicates a required field</p>

          <form onSubmit={handleSubmit} className="verify-form">
            <div className="verify-form-grid">
              <div className="verify-form-group">
                <label>ID Number <span className="required">*</span></label>
                <input
                  type="text"
                  name="idNumber"
                  placeholder="Enter your ID Number..."
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="verify-form-group">
                <label>Year of Birth (yyyy) <span className="required">*</span></label>
                <input
                  type="text"
                  name="yearOfBirth"
                  placeholder="Enter your Year of Birth..."
                  value={formData.yearOfBirth}
                  onChange={handleChange}
                  maxLength="4"
                  pattern="[0-9]{4}"
                  required
                />
              </div>
            </div>

            <div className="recaptcha-box">
              <input type="checkbox" id="robot" required />
              <label htmlFor="robot">I'm not a robot</label>
            </div>

            <button type="submit" className="verify-btn">Verify Now</button>
          </form>
        </div>
      </div>
      
      <Footer />
      
      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
    </div>
  );
};

export default VerifyVoter;
