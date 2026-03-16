import React, { useEffect, useRef, useState } from 'react';
import { featuredProjectOrder, projectsById } from '../../data/projects';
import { useProjectGallery } from '../../hooks/useProjectGallery';
import ResponsiveImage from '../media/ResponsiveImage';

const featuredProjects = featuredProjectOrder
  .map((id) => projectsById[id])
  .filter(Boolean)
  .map((project) => ({
    id: project.id,
    title: project.title,
    subtitle: project.description || project.meta || 'Project gallery',
  }));

const Hero = ({ onOpenModal }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const heroImgRef = useRef(null);

  const activeProject = featuredProjects[activeIndex] || featuredProjects[0] || null;
  const projectData = activeProject ? projectsById[activeProject.id] : null;
  const { thumbnailPublicId } = useProjectGallery(projectData);

  useEffect(() => {
    const handleScroll = () => {
      if (heroImgRef.current && window.scrollY < 640) {
        heroImgRef.current.style.transform = `scale(1.04) translateY(${window.scrollY * 0.18}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (featuredProjects.length < 2) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredProjects.length);
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  if (!activeProject) {
    return null;
  }

  return (
    <div className="hero">
      <div className="hero-slide">
        {thumbnailPublicId ? (
          <ResponsiveImage
            className="hero-img"
            publicId={thumbnailPublicId}
            alt={activeProject.title}
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            width={1800}
            style={{ transform: 'scale(1.04)' }}
            ref={heroImgRef}
          />
        ) : (
          <div className="hero-img" ref={heroImgRef}></div>
        )}
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="emoji-badge">✦ Featured Project</div>
          <div className="hero-title">{activeProject.title}</div>
          <div className="hero-subtitle">{activeProject.subtitle}</div>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => onOpenModal(activeProject.id)}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 1L10.5 6L1.5 11V1Z" fill="black" />
              </svg>
              View Project
            </button>
            <button className="hero-btn-secondary" onClick={() => onOpenModal(activeProject.id)}>
              + Info
            </button>
          </div>
          <div className="hero-dots">
            {featuredProjects.map((project, index) => (
              <button
                key={project.id}
                className={`hero-dot${activeIndex === index ? ' active' : ''}`}
                aria-label={`Show ${project.title}`}
                onClick={() => setActiveIndex(index)}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
