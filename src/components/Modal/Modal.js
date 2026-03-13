import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveCloudinaryPublicId } from '../../data/imageData';
import { useProjectGallery } from '../../hooks/useProjectGallery';
import ResponsiveImage from '../media/ResponsiveImage';
import projects from '../../data/projects';

const Modal = ({ isOpen, projectKey, onClose }) => {
  const overlayRef = useRef(null);
  const navigate = useNavigate();
  // Separate visible/open so close animation can play before unmounting
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => setOpen(true));
      document.body.style.overflow = 'hidden';
    } else {
      setOpen(false);
      const timer = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = '';
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const project = projectKey ? projects[projectKey] : null;
  const { thumbnailPublicId } = useProjectGallery(project);
  const imgId = resolveCloudinaryPublicId(thumbnailPublicId || project?.imgId);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleViewProject = () => {
    onClose();
    navigate(`/projects/${projectKey}`);
  };

  if (!visible || !project) return null;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay${open ? ' open' : ''}`}
      style={{ display: 'flex' }}
      onClick={handleOverlayClick}
    >
      <div className="modal-sheet" style={{ position: 'relative' }}>
        <div className="modal-handle"></div>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        {imgId ? (
          <ResponsiveImage
            className="modal-hero"
            publicId={imgId}
            alt={project.title}
            sizes="(max-width: 768px) 100vw, 900px"
            width={1400}
            style={{
              display: 'block',
              objectFit: project.imgId === 'ek' ? 'contain' : 'cover',
              background: project.imgId === 'ek' ? '#000' : '',
              padding: project.imgId === 'ek' ? '30px' : '',
            }}
          />
        ) : (
          <div
            className={`modal-hero-placeholder ${project.color || ''}`}
            style={{ display: 'flex', width: '100%', height: '200px', marginTop: '12px', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ fontSize: '60px', opacity: 0.25 }}>{project.icon || '✦'}</div>
          </div>
        )}

        <div className="modal-body">
          <div className="modal-category">{project.category}</div>
          <div className="modal-title">{project.title}</div>
          <div className="modal-desc">{project.desc}</div>
          <div className="modal-tags">
            {project.tags.map((tag) => (
              <span key={tag} className="modal-tag">{tag}</span>
            ))}
          </div>
          <button className="modal-btn" onClick={handleViewProject}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 1.5L12 7L2 12.5V1.5Z" fill="black" />
            </svg>
            View Full Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
