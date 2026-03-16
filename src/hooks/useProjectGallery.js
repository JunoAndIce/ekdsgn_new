import { useEffect, useMemo, useState } from 'react';

const buildMediaItems = (publicIds = [], title = 'Project') =>
  publicIds.map((publicId, index) => ({
    id: `${publicId}-${index}`,
    type: 'image',
    publicId,
    label: `${title} ${index + 1}`,
  }));

export const useProjectGallery = (project) => {
  const fallbackPublicId = String(project?.fallbackPublicId || '').trim();
  const configuredPublicIds = useMemo(
    () => (Array.isArray(project?.publicIds)
      ? project.publicIds.map((id) => String(id || '').trim()).filter(Boolean)
      : []),
    [project?.publicIds]
  );

  const [thumbnailPublicId, setThumbnailPublicId] = useState(fallbackPublicId);
  const [mediaItems, setMediaItems] = useState(
    fallbackPublicId
      ? [{ id: `${project?.id || 'fallback'}-fallback`, type: 'image', publicId: fallbackPublicId, label: project?.title || 'Project' }]
      : []
  );
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState('');

  useEffect(() => {
    const media = buildMediaItems(configuredPublicIds, project?.title || 'Project');
    setThumbnailPublicId(configuredPublicIds[0] || fallbackPublicId || '');
    setMediaItems(media);
    setGalleryError(configuredPublicIds.length ? '' : 'No images found in this Cloudinary folder.');
    setIsGalleryLoading(false);
  }, [configuredPublicIds, fallbackPublicId, project?.title]);

  return {
    thumbnailPublicId,
    mediaItems,
    isGalleryLoading,
    galleryError,
  };
};
