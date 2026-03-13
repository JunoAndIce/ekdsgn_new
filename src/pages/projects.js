import React, { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import '../assets/css/portfolio.css';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { resolveCloudinaryPublicId } from '../data/imageData';
import ProjectMediaCarousel from '../components/media/ProjectMediaCarousel';
import ResponsiveImage from '../components/media/ResponsiveImage';
import { useProjectGallery } from '../hooks/useProjectGallery';
import projects, { defaultProjectKey, projectOrder } from '../data/projects';

const ProjectSwitcherItem = ({ activeProjectKey, projectKey, onSelect }) => {
  const project = projects[projectKey];

  return (
    <button
      className={`project-switcher-item${projectKey === activeProjectKey ? ' active' : ''}`}
      onClick={() => onSelect(projectKey)}
    >
      <span className="project-switcher-title">{project.title}</span>
      <span className="project-switcher-meta">{project.meta || project.category}</span>
    </button>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const { projectKey } = useParams();
  const fallbackProjectKey = projectOrder[0] || defaultProjectKey;
  const hasValidProject = !projectKey || Boolean(projects[projectKey]);
  const activeProjectKey = hasValidProject ? projectKey || fallbackProjectKey : fallbackProjectKey;
  const project = projects[activeProjectKey];
  const {
    hasVideo: projectHasVideo,
    isGalleryLoading,
    galleryError,
    mediaItems,
    thumbnailPublicId,
  } = useProjectGallery(project);
  const heroImageId = resolveCloudinaryPublicId(thumbnailPublicId || project.imgId);
  const mediaBadgeText = isGalleryLoading
    ? 'Loading Gallery...'
    : galleryError
      ? 'Gallery Offline'
      : projectHasVideo
        ? 'Video + Image'
        : 'Image Gallery';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeProjectKey]);

  if (!hasValidProject) {
    return <Navigate to={`/projects/${fallbackProjectKey}`} replace />;
  }

  return (
    <>
      <Navbar />
      <main className="main project-page">
        <section className="project-hero">
          {heroImageId ? (
            <ResponsiveImage
              className="project-hero-image"
              publicId={heroImageId}
              alt={project.title}
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              width={1800}
            />
          ) : (
            <div className={`project-hero-image project-hero-placeholder ${project.color || ''}`}>
              <span className="project-hero-placeholder-icon">{project.icon || '✦'}</span>
            </div>
          )}
          <div className="project-hero-overlay"></div>
          <div className="project-hero-content">
            <div className="emoji-badge">✦ Project Archive</div>
            <div className="project-hero-meta">{project.category}</div>
            <h1 className="project-hero-title">{project.title}</h1>
            <p className="project-hero-subtitle">{project.heroSubtitle || project.desc}</p>
          </div>
        </section>

        <section className="project-shell">
          <div className="project-switcher">
            {projectOrder.map((key) => (
              <ProjectSwitcherItem
                key={key}
                activeProjectKey={activeProjectKey}
                projectKey={key}
                onSelect={(nextKey) => navigate(`/projects/${nextKey}`)}
              />
            ))}
          </div>

          <div className="project-layout">
            <div className="project-main-column">
              <section className="project-card">
                <div className="project-card-kicker">Current Project</div>
                <h2 className="project-card-title">Overview</h2>
                <p className="project-copy project-copy-lead">{project.desc}</p>
                {(project.overview || []).map((paragraph) => (
                  <p key={paragraph} className="project-copy">{paragraph}</p>
                ))}
              </section>

              <section className="project-card">
                <div className="project-card-header">
                  <div>
                    <div className="project-card-kicker">Media</div>
                    <h2 className="project-card-title">Video / Image Viewer</h2>
                  </div>
                  <span className="project-media-badge">
                    {mediaBadgeText}
                  </span>
                </div>

                <ProjectMediaCarousel
                  mediaItems={mediaItems}
                  projectTitle={project.title}
                  fallbackPublicId={thumbnailPublicId || project.imgId}
                  fallbackLabel="Primary project media"
                  fallbackIcon={project.icon || '✦'}
                  fallbackClassName={project.color || ''}
                />
                {galleryError ? (
                  <p className="project-media-status">Live folder sync unavailable. Showing fallback media.</p>
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
                    <span className="project-detail-value">{project.category}</span>
                  </div>
                  <div className="project-detail-row">
                    <span className="project-detail-label">Format</span>
                    <span className="project-detail-value">
                      {projectHasVideo ? 'Video + Image' : 'Image-led'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="project-card">
                <div className="project-card-kicker">Deliverables</div>
                <h2 className="project-card-title">Scope</h2>
                <div className="project-tag-list">
                  {(project.deliverables || []).map((item) => (
                    <span key={item} className="project-pill">{item}</span>
                  ))}
                </div>
              </section>

              <section className="project-card">
                <div className="project-card-kicker">Tags</div>
                <h2 className="project-card-title">Keywords</h2>
                <div className="project-tag-list">
                  {project.tags.map((tag) => (
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