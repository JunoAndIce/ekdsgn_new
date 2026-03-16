import React from 'react';
import ResponsiveImage from '../media/ResponsiveImage';
import { useProjectGallery } from '../../hooks/useProjectGallery';

const CardWide = ({ project, onOpenModal }) => {
  const {
    title,
    meta,
    placeholderIcon,
    placeholderClass,
  } = project;

  const { thumbnailPublicId } = useProjectGallery(project);

  return (
    <div className="card-wide" onClick={() => onOpenModal?.(project.id)}>
      {thumbnailPublicId ? (
        <ResponsiveImage
          publicId={thumbnailPublicId}
          alt={title}
          sizes="(max-width: 900px) 100vw, 48vw"
          width={1200}
        />
      ) : (
        <div className={`${placeholderClass || ''} card-placeholder-content`}>
          <div className="card-placeholder-icon">{placeholderIcon || '✦'}</div>
          <div className="card-placeholder-name">{title}</div>
        </div>
      )}
      <div className="card-wide-overlay"></div>
      <div className="card-wide-label">
        <div className="card-wide-name">{title}</div>
        <div className="card-wide-meta">{meta}</div>
      </div>
    </div>
  );
};

export default CardWide;
