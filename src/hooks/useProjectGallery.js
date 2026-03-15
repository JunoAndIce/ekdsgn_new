import { useEffect, useState } from 'react';
import { fetchCloudinaryFolderPublicIds } from '../lib/cloudinary';

const galleryCache = new Map();
const inflightGalleryRequests = new Map();

const createGalleryMediaItems = ({ publicIds, labelPrefix }) =>
  publicIds.map((publicId, index) => ({
    id: `gallery-${publicId}-${index}`,
    type: 'image',
    publicId,
    label: `${labelPrefix || 'Gallery image'} ${index + 1}`,
  }));

const getFallbackThumbnail = (project) => project?.thumbnailPublicId || project?.imgId || null;

export const useProjectGallery = (project) => {
  const galleryFolderPath = project?.galleryFolderPath || '';
  const galleryLabelPrefix = project?.galleryLabelPrefix;
  const staticThumbnailPublicId = project?.thumbnailPublicId;
  const baseMediaItems = project?.media || [];
  const [galleryMediaItems, setGalleryMediaItems] = useState([]);
  const [thumbnailPublicId, setThumbnailPublicId] = useState(getFallbackThumbnail(project));
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [hasGalleryMedia, setHasGalleryMedia] = useState(false);
  const fallbackThumbnailPublicId = getFallbackThumbnail(project);
  const hasStaticMedia = Boolean(fallbackThumbnailPublicId) || baseMediaItems.length > 0;

  useEffect(() => {
    let isCancelled = false;

    const loadGallery = async () => {
      const folderPath = galleryFolderPath;

      if (!folderPath) {
        setGalleryMediaItems([]);
        setThumbnailPublicId(fallbackThumbnailPublicId);
        setIsGalleryLoading(false);
        setGalleryError('');
        setHasGalleryMedia(hasStaticMedia);
        return;
      }

      if (galleryCache.has(folderPath)) {
        const publicIds = galleryCache.get(folderPath);
        setGalleryMediaItems(
          createGalleryMediaItems({
            publicIds,
            labelPrefix: galleryLabelPrefix,
          })
        );
        setThumbnailPublicId(staticThumbnailPublicId || publicIds[0] || fallbackThumbnailPublicId);
        setIsGalleryLoading(false);
        setGalleryError('');
        setHasGalleryMedia(publicIds.length > 0 || hasStaticMedia);
        return;
      }

      setIsGalleryLoading(true);
      setGalleryError('');

      const request =
        inflightGalleryRequests.get(folderPath) || fetchCloudinaryFolderPublicIds(folderPath);
      inflightGalleryRequests.set(folderPath, request);

      let publicIds = [];

      try {
        publicIds = await request;
      } catch (error) {
        if (!isCancelled) {
          setGalleryMediaItems([]);
          setThumbnailPublicId(fallbackThumbnailPublicId);
          setGalleryError(error?.message || 'Unable to load gallery right now.');
          setHasGalleryMedia(hasStaticMedia);
        }
        return;
      } finally {
        inflightGalleryRequests.delete(folderPath);
        if (!isCancelled) {
          setIsGalleryLoading(false);
        }
      }

      galleryCache.set(folderPath, publicIds);

      if (isCancelled) {
        return;
      }

      if (!publicIds.length) {
        setGalleryMediaItems([]);
        setThumbnailPublicId(fallbackThumbnailPublicId);
        setGalleryError('');
        setHasGalleryMedia(hasStaticMedia);
        return;
      }

      setGalleryMediaItems(
        createGalleryMediaItems({
          publicIds,
          labelPrefix: galleryLabelPrefix,
        })
      );
      setThumbnailPublicId(staticThumbnailPublicId || publicIds[0]);
      setGalleryError('');
      setHasGalleryMedia(true);
    };

    loadGallery();

    return () => {
      isCancelled = true;
    };
  }, [
    fallbackThumbnailPublicId,
    galleryFolderPath,
    galleryLabelPrefix,
    hasStaticMedia,
    staticThumbnailPublicId,
  ]);

  const hasVideo = baseMediaItems.some((item) => item.type === 'video' && item.src);

  return {
    hasVideo,
    hasGalleryMedia,
    isGalleryLoading,
    galleryError,
    thumbnailPublicId,
    mediaItems: [...baseMediaItems, ...galleryMediaItems],
  };
};
