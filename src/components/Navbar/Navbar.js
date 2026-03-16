import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { imagePublicIds } from '../../data/imageData';
import ResponsiveImage from '../media/ResponsiveImage';

const navItems = [
  {
    label: 'Home',
    to: '/',
    isActive: (pathname) => pathname === '/',
  },
  {
    label: 'Projects',
    to: '/projects',
    isActive: (pathname) => pathname.startsWith('/projects'),
  },
  {
    label: 'About',
    to: '/contact-us',
    isActive: (pathname) => pathname.startsWith('/contact-us'),
  },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = () => setMenuOpen(false);

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <ResponsiveImage
        className="header-logo"
        publicId={imagePublicIds.headerLogo}
        alt="EK"
        loading="eager"
        fetchPriority="high"
        sizes="220px"
        width={440}
      />

      <nav className="header-nav" ref={navRef} aria-label="Primary">
        <div className="header-nav-list desktop-nav" role="menubar">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`top-nav-link${item.isActive(pathname) ? ' active' : ''}`}
              onClick={handleSelect}
              role="menuitem"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          className={`mobile-nav-toggle${menuOpen ? ' open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`mobile-nav-panel${menuOpen ? ' open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`top-nav-link mobile-link${item.isActive(pathname) ? ' active' : ''}`}
              onClick={handleSelect}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
