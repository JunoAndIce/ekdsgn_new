import React from 'react';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Contact from '../pages/contact';
import Home from '../pages/home';
import Projects from '../pages/projects';
import { defaultProjectKey } from '../data/projects';

const RouterComponent = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Navigate to={`/projects/${defaultProjectKey}`} replace />} />
          <Route path="/projects/:projectKey" element={<Projects />} />
          <Route path="/contact-us" element={<Contact />} />
          {/* Add other routes as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default RouterComponent;