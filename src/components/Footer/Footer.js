import React from 'react';
import ekWhiteLogo from '../../assets/images/EKWHITE.png';

const Footer = () => {
  return (
    <div className="footer">
      <img
        className="footer-logo"
        src={ekWhiteLogo}
        alt="EK"
      />
      <div className="footer-name">
        Ekemini Ekwere — Houston, TX
        <br />
        Founder &amp; CEO, hwy6 · Creative Director
      </div>
      <div className="footer-links">
        <span className="footer-link">Instagram</span>
        <span className="footer-link">YouTube</span>
        <span className="footer-link">Contact</span>
      </div>
    </div>
  );
};

export default Footer;
