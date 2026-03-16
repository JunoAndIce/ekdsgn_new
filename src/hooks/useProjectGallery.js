import { useEffect, useMemo, useState } from 'react';
import cloudinaryGalleryManifest from '../data/cloudinaryGalleryManifest.json';

const galleryCache = new Map();

const getManifestPublicIds = (folderPath) => {
  const galleries = cloudinaryGalleryManifest?.galleries;
  const galleryItems = galleries ? galleries[folderPath] : [];
  return Array.isArray(galleryItems)
    ? galleryItems.map((id) => String(id || '').trim()).filter(Boolean)
    : [];
};

const buildMediaItems = (publicIds = [], title = 'Project') =>
  publicIds.map((publicId, index) => ({
    id: `${publicId}-${index}`,
    type: 'image',
    publicId,
    label: `${title} ${index + 1}`,
  }));

export const useProjectGallery = (project) => {
  const folderPath = String(project?.folderPath || '').trim();
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
    let cancelled = false;

    const loadGallery = async () => {
      if (configuredPublicIds.length) {
        const media = buildMediaItems(configuredPublicIds, project?.title || 'Project');
        setThumbnailPublicId(configuredPublicIds[0] || fallbackPublicId);
        setMediaItems(media);
        setGalleryError('');
        setIsGalleryLoading(false);
        return;
      }

      if (!folderPath) {
        setThumbnailPublicId(fallbackPublicId);
        setMediaItems(
          fallbackPublicId
            ? [{ id: `${project?.id || 'fallback'}-fallback`, type: 'image', publicId: fallbackPublicId, label: project?.title || 'Project' }]
            : []
        );
        setGalleryError('');
        setIsGalleryLoading(false);
        return;
      }

      const cachedPublicIds = galleryCache.has(folderPath)
        ? galleryCache.get(folderPath) || []
        : getManifestPublicIds(folderPath);

      galleryCache.set(folderPath, cachedPublicIds);

      const media = buildMediaItems(cachedPublicIds, project?.title || 'Project');
      setThumbnailPublicId(cachedPublicIds[0] || fallbackPublicId);
      setMediaItems(
        media.length
          ? media
          : fallbackPublicId
            ? [{ id: `${project?.id || 'fallback'}-fallback`, type: 'image', publicId: fallbackPublicId, label: project?.title || 'Project' }]
            : []
      );
      setGalleryError(cachedPublicIds.length ? '' : 'Manifest has no media for this folder yet.');
      setIsGalleryLoading(false);
    };

    loadGallery();

    return () => {
      cancelled = true;
    };
  }, [configuredPublicIds, fallbackPublicId, folderPath, project?.id, project?.title]);

  return {
    thumbnailPublicId,
    mediaItems,
    isGalleryLoading,
    galleryError,
  };
};
