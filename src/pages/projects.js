import React, { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import '../assets/css/portfolio.css';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ProjectMediaCarousel from '../components/media/ProjectMediaCarousel';
import ResponsiveImage from '../components/media/ResponsiveImage';
import { useProjectGallery } from '../hooks/useProjectGallery';
import { defaultProjectKey, projectCards, projectsById } from '../data/projects';

const Projects = () => {
  const navigate = useNavigate();
  const { projectKey } = useParams();

  const fallbackProjectKey = defaultProjectKey;
  const hasValidProject = Boolean(projectsById[projectKey || '']) || !projectKey;
  const activeProjectKey = hasValidProject ? projectKey || fallbackProjectKey : fallbackProjectKey;
  const project = projectsById[activeProjectKey];

  const {
    mediaItems,
    thumbnailPublicId,
    isGalleryLoading,
    galleryError,
  } = useProjectGallery(project);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeProjectKey]);

  if (!hasValidProject || !project) {
    return <Navigate to={`/projects/${fallbackProjectKey}`} replace />;
  }

  return (
    <>
      <Navbar />
      <main className="main project-page">
        <section className="project-hero">
          {thumbnailPublicId ? (
            <ResponsiveImage
              className="project-hero-image"
              publicId={thumbnailPublicId}
              alt={project.title}
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              width={1800}
            />
          ) : (
            <div className={`project-hero-image project-hero-placeholder ${project.placeholderClass || ''}`}>
              <span className="project-hero-placeholder-icon">{project.placeholderIcon || '✦'}</span>
            </div>
          )}
          <div className="project-hero-overlay"></div>
          <div className="project-hero-content">
            <div className="emoji-badge">✦ Project Archive</div>
            <div className="project-hero-meta">{project.meta}</div>
            <h1 className="project-hero-title">{project.title}</h1>
            <p className="project-hero-subtitle">{project.description}</p>
          </div>
        </section>

        <section className="project-shell">
          <div className="project-switcher">
            {projectCards.map((item) => (
              <button
                key={item.id}
                className={`project-switcher-item${item.id === activeProjectKey ? ' active' : ''}`}
                onClick={() => navigate(`/projects/${item.id}`)}
              >
                <span className="project-switcher-title">{item.title}</span>
                <span className="project-switcher-meta">{item.meta}</span>
              </button>
            ))}
          </div>

          <div className="project-layout">
            <div className="project-main-column">
              <section className="project-card">
                <div className="project-card-kicker">Current Project</div>
                <h2 className="project-card-title">Overview</h2>
                <p className="project-copy project-copy-lead">{project.description}</p>
              </section>

              <section className="project-card">
                <div className="project-card-header">
                  <div>
                    <div className="project-card-kicker">Media</div>
                    <h2 className="project-card-title">Image Viewer</h2>
                  </div>
                  <span className="project-media-badge">
                    {isGalleryLoading ? 'Loading Gallery...' : 'Image Gallery'}
                  </span>
                </div>

                <ProjectMediaCarousel
                  mediaItems={mediaItems}
                  projectTitle={project.title}
                  fallbackPublicId={thumbnailPublicId || project.fallbackPublicId}
                  fallbackIcon={project.placeholderIcon || '✦'}
                  fallbackClassName={project.placeholderClass || ''}
                />
                {galleryError ? (
                  <p className="project-media-status">{galleryError}</p>
                ) : null}
              </section>
            </div>

            <aside className="project-sidebar">
              <section className="project-card">
                <div className="project-card-kicker">Snapshot</div>
                <h2 className="project-card-title">Details</h2>
                <div className="project-detail-list">
                  <div className="project-detail-row">
                    <span className="project-detail-label">Project</span>
                    <span className="project-detail-value">{project.title}</span>
                  </div>
                  <div className="project-detail-row">
                    <span className="project-detail-label">Category</span>
                    <span className="project-detail-value">{project.meta}</span>
                  </div>
                  <div className="project-detail-row">
                    <span className="project-detail-label">Folder</span>
                    <span className="project-detail-value">{project.folderPath}</span>
                  </div>
                </div>
              </section>

              <section className="project-card">
                <div className="project-card-kicker">Tags</div>
                <h2 className="project-card-title">Keywords</h2>
                <div className="project-tag-list">
                  {(project.tags || []).map((tag) => (
                    <span key={tag} className="project-pill muted">{tag}</span>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Projects;
