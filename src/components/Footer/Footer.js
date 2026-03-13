import React from 'react';
import { imagePublicIds } from '../../data/imageData';
import ResponsiveImage from '../media/ResponsiveImage';

const Footer = () => {
  return (
    <div className="footer">
      <ResponsiveImage
        className="footer-logo"
        publicId={imagePublicIds.footerLogo}
        alt="EK"
        sizes="200px"
        width={400}
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
