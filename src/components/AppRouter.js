import React from 'react';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import AboutPage from '../pages/about';
import Home from '../pages/home';
import Projects from '../pages/projects';
import { defaultProjectKey } from '../data/projects';

const AppRouter = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/projects"
            element={defaultProjectKey ? <Navigate to={`/projects/${defaultProjectKey}`} replace /> : <Projects />}
          />
          <Route path="/projects/:projectKey" element={<Projects />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact-us" element={<Navigate to="/about" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRouter;