import React, { useState } from 'react';
import CustomAlert from './CustomAlert';
import '../App.css';

const RegisterVoter = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    county: '',
    constituency: '',
    ward: '',
    pollingStation: '',
    gender: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setAlert({ message: 'Passwords do not match!', type: 'error' });
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAlert({ message: 'Registration successful!\nYou can now login to vote.', type: 'success' });
        setTimeout(() => onClose(), 2000);
      } else {
        setAlert({ message: data.error || 'Registration failed', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Error connecting to server', type: 'error' });
      console.error(error);
    }
  };

  return (
    <div className="register-voter-modal">
      <div className="register-voter-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Register as a Voter</h2>
        <img src="/IEBC.png" alt="IEBC Logo" className="register-logo" />
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <input type="text" name="firstName" placeholder="First Name *" value={formData.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Last Name *" value={formData.lastName} onChange={handleChange} required />
          </div>
          
          <input type="text" name="nationalId" placeholder="National ID Number *" value={formData.nationalId} onChange={handleChange} required />
          
          <input type="date" name="dateOfBirth" placeholder="Date of Birth *" value={formData.dateOfBirth} onChange={handleChange} required />
          
          <div className="form-row">
            <input type="tel" name="phoneNumber" placeholder="Phone Number *" value={formData.phoneNumber} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} required />
          </div>
          
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender *</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          
          <input type="text" name="address" placeholder="Physical Address" value={formData.address} onChange={handleChange} />
          
          <div className="form-row">
            <select name="county" value={formData.county} onChange={handleChange} required>
              <option value="">Select County *</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Kisumu">Kisumu</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Eldoret">Eldoret</option>
            </select>
            <input type="text" name="constituency" placeholder="Constituency *" value={formData.constituency} onChange={handleChange} required />
          </div>
          
          <div className="form-row">
            <input type="text" name="ward" placeholder="Ward *" value={formData.ward} onChange={handleChange} required />
            <input type="text" name="pollingStation" placeholder="Polling Station *" value={formData.pollingStation} onChange={handleChange} required />
          </div>
          
          <div className="form-row">
            <input type="password" name="password" placeholder="Password *" value={formData.password} onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password *" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
          
          <button type="submit" className="submit-btn">Register</button>
        </form>
      </div>
      
      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
    </div>
  );
};

export default RegisterVoter;
