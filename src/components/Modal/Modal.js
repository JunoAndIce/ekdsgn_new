import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectGallery } from '../../hooks/useProjectGallery';
import ResponsiveImage from '../media/ResponsiveImage';

const Modal = ({ isOpen, project, onClose }) => {
  const overlayRef = useRef(null);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => setOpen(true));
      document.body.style.overflow = 'hidden';
      return undefined;
    }

    setOpen(false);
    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = '';
    }, 400);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const { thumbnailPublicId } = useProjectGallery(project);

  const handleOverlayClick = (event) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  const handleViewProject = () => {
    if (!project?.id) {
      return;
    }

    onClose();
    navigate(`/projects/${project.id}`);
  };

  if (!visible || !project) {
    return null;
  }

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

        {thumbnailPublicId ? (
          <ResponsiveImage
            className="modal-hero"
            publicId={thumbnailPublicId}
            alt={project.title}
            sizes="(max-width: 768px) 100vw, 900px"
            width={1400}
          />
        ) : (
          <div
            className={`modal-hero-placeholder ${project.placeholderClass || ''}`}
            style={{ display: 'flex', width: '100%', height: '200px', marginTop: '12px', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ fontSize: '60px', opacity: 0.25 }}>{project.placeholderIcon || '✦'}</div>
          </div>
        )}

        <div className="modal-body">
          <div className="modal-category">{project.meta}</div>
          <div className="modal-title">{project.title}</div>
          <div className="modal-desc">{project.description || 'Project details available in full view.'}</div>
          <div className="modal-tags">
            {(project.tags || []).map((tag) => (
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
