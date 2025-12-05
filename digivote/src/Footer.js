import React from 'react';
import './App.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-column">
          <h3>ADDRESS</h3>
          <p>University Way, Anniversary Towers, 6th Floor,</p>
          <p>P.O Box 45371 - 00100, Nairobi.</p>
          <p>Tel No: (254) 020 - 2877000</p>
          <p>Email Address: info@iebc.or.ke</p>
        </div>

        <div className="footer-column">
          <h3>ABOUT IEBC</h3>
          <ul>
            <li><a href="https://www.iebc.or.ke/iebc/?mandate">The Mandate</a></li>
            <li><a href="https://www.iebc.or.ke/iebc/?commissioners">The Commission</a></li>
            <li><a href="https://www.iebc.or.ke/iebc/?secretariet">The Secretariat</a></li>
            <li><a href="https://www.iebc.or.ke/iebc/?regional">Constituency Offices</a></li>
            <li><a href="https://www.iebc.or.ke/iebc/?vission">Vision and Mission</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>WORK WITH US</h3>
          <ul>
            <li><a href="https://jobs.iebc.or.ke/">Vacancies</a></li>
            <li><a href="https://www.iebc.or.ke/work?tenders">Tenders</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>DOWNLOADS</h3>
          <ul>
            <li><a href="https://www.iebc.or.ke/resources/?Publications_/_Reports">Publications / Reports</a></li>
            <li><a href="https://www.iebc.or.ke/resources/?Party_list">Party list</a></li>
            <li><a href="https://www.iebc.or.ke/resources/?Forms">Forms</a></li>
            <li><a href="https://www.iebc.or.ke/resources/?Court_Rulings">Court Rulings</a></li>
            <li><a href="https://www.iebc.or.ke/resources/?Boundary_Delimitation">Boundary Delimitation</a></li>
            <li><a href="https://www.iebc.or.ke/electionlaws/?Electoral_Acts">Electoral Laws and Regulations</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <a href="https://www.iebc.or.ke/sitemap/?sitemap">Site Map</a>
        </div>
        <div className="footer-bottom-center">
          <button onClick={() => window.location.href='https://mail.iebc.or.ke/'}>Staff Email</button>
          <button onClick={() => window.location.href='https://outlook.office365.com/owa/iebc.or.ke/'}>Staff Mail - Office 365</button>
        </div>
        <div className="footer-bottom-right">
          <p>Copyright ©2025 IEBC. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
