import React from 'react';
import '../App.css';

const CustomAlert = ({ message, type, onClose }) => {
  return (
    <div className="custom-alert-overlay" onClick={onClose}>
      <div className={`custom-alert ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="alert-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'info' && 'ℹ'}
        </div>
        <div className="alert-message">{message}</div>
        <button className="alert-close-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default CustomAlert;
