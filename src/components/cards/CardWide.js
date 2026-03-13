import React from 'react';
import { resolveCloudinaryPublicId } from '../../data/imageData';
import ResponsiveImage from '../media/ResponsiveImage';
import { useProjectGallery } from '../../hooks/useProjectGallery';
import projects from '../../data/projects';

const CardWide = ({ projectKey, name, meta, onOpenModal, placeholderIcon, placeholderClass }) => {
  const project = projects[projectKey];
  const { thumbnailPublicId } = useProjectGallery(project);

  const imgId = resolveCloudinaryPublicId(thumbnailPublicId || project?.imgId);
  const iconToShow = placeholderIcon || project?.icon;
  const classToShow = placeholderClass || project?.color || '';

  return (
    <div className="card-wide" onClick={() => onOpenModal(projectKey)}>
      {imgId ? (
        <ResponsiveImage
          publicId={imgId}
          alt={name}
          sizes="(max-width: 900px) 100vw, 48vw"
          width={1200}
        />
      ) : (
        <div className={`${classToShow} card-placeholder-content`}>
          <div className="card-placeholder-icon">{iconToShow}</div>
          <div className="card-placeholder-name">{name}</div>
        </div>
      )}
      <div className="card-wide-overlay"></div>
      <div className="card-wide-label">
        <div className="card-wide-name">{name}</div>
        <div className="card-wide-meta">{meta}</div>
      </div>
    </div>
  );
};

export default CardWide;
