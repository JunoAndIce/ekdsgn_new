import React, { useEffect, useMemo, useState } from 'react';
import ResponsiveImage from './ResponsiveImage';

const ProjectMediaCarousel = ({ mediaItems = [], projectTitle, fallbackPublicId, fallbackIcon = '✦', fallbackClassName = '' }) => {
  const items = useMemo(() => {
    if (mediaItems.length) {
      return mediaItems;
    }

    if (!fallbackPublicId) {
      return [];
    }

    return [{
      id: 'fallback-media',
      type: 'image',
      publicId: fallbackPublicId,
      label: `${projectTitle} cover`,
    }];
  }, [fallbackPublicId, mediaItems, projectTitle]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  const activeItem = items[activeIndex] || null;

  return (
    <>
      <div className="project-media-stage">
        {activeItem?.publicId ? (
          <ResponsiveImage
            className="project-media-asset"
            publicId={activeItem.publicId}
            alt={activeItem.label || projectTitle}
            sizes="(max-width: 900px) 100vw, 900px"
            width={1600}
          />
        ) : (
          <div className={`project-media-fallback ${fallbackClassName}`}>
            <span className="project-media-fallback-icon">{fallbackIcon}</span>
          </div>
        )}
      </div>

      <div className="project-media-meta">
        <div className="project-media-caption">{activeItem?.label || projectTitle}</div>
        {items.length > 1 ? (
          <div className="project-media-counter">{activeIndex + 1} / {items.length}</div>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="project-media-dots" aria-label={`${projectTitle} media navigation`}>
          {items.map((item, index) => (
            <button
              key={item.id}
              className={`project-media-dot${index === activeIndex ? ' active' : ''}`}
              aria-label={`Show ${item.label || `${projectTitle} media ${index + 1}`}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </>
  );
};

export default ProjectMediaCarousel;
