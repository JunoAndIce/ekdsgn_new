import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
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
        <span className="footer-link instagram" aria-label="Instagram">
          <FontAwesomeIcon icon={faInstagram} />
        </span>
        <span className="footer-link youtube" aria-label="YouTube">
          <FontAwesomeIcon icon={faYoutube} />
        </span>
        <span className="footer-link email" aria-label="Contact">
          <FontAwesomeIcon icon={faEnvelope} />
        </span>
      </div>
      <div className="footer-credit">
        <span className="footer-credit-label">Production Credits</span>
        <p className="footer-credit-copy">
          Frontend design by Ekemini Ekwere.<br/>
          Backend, API Integration by{' '}
          <a
            className="footer-credit-link"
            href="https://github.com/JunoAndIce"
            target="_blank"
            rel="noreferrer"
          >
            Juno and Ice
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Footer;
