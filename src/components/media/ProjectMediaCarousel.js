import React, { useEffect, useMemo, useState } from 'react';
import { resolveCloudinaryImageUrl, resolveCloudinaryPublicId } from '../../data/imageData';
import ResponsiveImage from './ResponsiveImage';

const normalizeMediaItems = ({ mediaItems, fallbackPublicId, fallbackLabel }) => {
  const normalizedItems = (mediaItems || [])
    .map((item, index) => {
      if (item.type === 'video') {
        if (!item.src) {
          return null;
        }

        return {
          ...item,
          id: item.id || `video-${index}`,
          posterPublicId: resolveCloudinaryPublicId(
            item.posterPublicId || item.posterImgId || fallbackPublicId
          ),
        };
      }

      const publicId = resolveCloudinaryPublicId(item.publicId || item.imgId || fallbackPublicId);

      if (!publicId) {
        return null;
      }

      return {
        ...item,
        id: item.id || `image-${index}`,
        type: 'image',
        publicId,
      };
    })
    .filter(Boolean);

  if (normalizedItems.length) {
    return normalizedItems;
  }

  const resolvedFallbackPublicId = resolveCloudinaryPublicId(fallbackPublicId);

  if (!resolvedFallbackPublicId) {
    return [];
  }

  return [
    {
      id: 'fallback-image',
      type: 'image',
      publicId: resolvedFallbackPublicId,
      label: fallbackLabel,
    },
  ];
};

const ProjectMediaCarousel = ({
  mediaItems,
  projectTitle,
  fallbackPublicId,
  fallbackLabel = 'Primary project media',
  fallbackIcon = '✦',
  fallbackClassName = '',
}) => {
  const normalizedMediaItems = useMemo(
    () => normalizeMediaItems({ mediaItems, fallbackPublicId, fallbackLabel }),
    [fallbackLabel, fallbackPublicId, mediaItems]
  );
  const defaultMediaIndex = useMemo(() => {
    const videoIndex = normalizedMediaItems.findIndex((item) => item.type === 'video');

    return videoIndex >= 0 ? videoIndex : 0;
  }, [normalizedMediaItems]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(defaultMediaIndex);

  useEffect(() => {
    setActiveMediaIndex(defaultMediaIndex);
  }, [defaultMediaIndex]);

  const activeMedia = normalizedMediaItems[activeMediaIndex] || normalizedMediaItems[0] || null;

  return (
    <>
      <div className="project-media-stage">
        {activeMedia?.type === 'video' ? (
          // Keep native video for now; reintroduce provider-specific player here later if needed.
          <video
            className="project-media-asset"
            controls
            playsInline
            preload="metadata"
            poster={resolveCloudinaryImageUrl(activeMedia.posterPublicId, { width: 1600 }) || undefined}
          >
            <source src={activeMedia.src} type="video/mp4" />
          </video>
        ) : activeMedia?.publicId ? (
          <ResponsiveImage
            className="project-media-asset"
            publicId={activeMedia.publicId}
            alt={activeMedia.label || projectTitle}
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
        <div className="project-media-caption">{activeMedia?.label || fallbackLabel}</div>
        {normalizedMediaItems.length > 1 ? (
          <div className="project-media-counter">
            {activeMediaIndex + 1} / {normalizedMediaItems.length}
          </div>
        ) : null}
      </div>

      {normalizedMediaItems.length > 1 ? (
        <div className="project-media-dots" aria-label={`${projectTitle} media navigation`}>
          {normalizedMediaItems.map((item, index) => (
            <button
              key={item.id}
              className={`project-media-dot${index === activeMediaIndex ? ' active' : ''}`}
              aria-label={`Show ${item.label || `${projectTitle} media ${index + 1}`}`}
              aria-pressed={index === activeMediaIndex}
              onClick={() => setActiveMediaIndex(index)}
              title={item.label || `${projectTitle} media ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </>
  );
};

export default ProjectMediaCarousel;