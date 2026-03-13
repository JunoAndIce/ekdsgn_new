import { useEffect, useState } from 'react';
import { fetchCloudinaryFolders } from '../lib/cloudinary';

const foldersCache = new Map();

export const useCloudinaryFolders = ({ prefix = '' } = {}) => {
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadFolders = async () => {
      if (foldersCache.has(prefix)) {
        setFolders(foldersCache.get(prefix));
        setError('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await fetchCloudinaryFolders(prefix);

        if (isCancelled) {
          return;
        }

        foldersCache.set(prefix, data);
        setFolders(data);
      } catch (loadError) {
        if (!isCancelled) {
          setFolders([]);
          setError(loadError?.message || 'Unable to load Cloudinary folders.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    // The folder index powers dynamic UI filtering and project-folder discovery.
    loadFolders();

    return () => {
      isCancelled = true;
    };
  }, [prefix]);

  return {
    folders,
    isLoading,
    error,
  };
};
