const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_API_BASE_URL = process.env.REACT_APP_CLOUDINARY_API_BASE_URL || '';
const CLOUDINARY_GALLERY_API_URL = process.env.REACT_APP_CLOUDINARY_GALLERY_API_URL || '';
const CLOUDINARY_DEBUG = process.env.REACT_APP_CLOUDINARY_DEBUG === 'true';

const DEFAULT_WIDTH = 1400;
const DEFAULT_QUALITY = 'auto';
const DEFAULT_FORMAT = 'auto';
const cloudinaryApiCallLog = [];

const recordCloudinaryApiCall = ({ source, folderPath, url, ok, status, count, error }) => {
  const entry = {
    timestamp: new Date().toISOString(),
    source,
    folderPath,
    url,
    ok,
    status,
    count,
    error,
  };

  cloudinaryApiCallLog.push(entry);

  if (CLOUDINARY_DEBUG) {
    // Useful for quickly validating folder reads in development.
    console.info('[Cloudinary API]', entry);
  }
};

export const getCloudinaryApiCallLog = () => [...cloudinaryApiCallLog];

export const clearCloudinaryApiCallLog = () => {
  cloudinaryApiCallLog.length = 0;
};

const buildBackendUrl = (pathName, params = {}) => {
  const normalizedBaseUrl = CLOUDINARY_API_BASE_URL.replace(/\/$/, '');
  const fallbackBaseUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/api` : '';
  const baseUrl = normalizedBaseUrl || fallbackBaseUrl;

  if (!baseUrl) {
    throw new Error('Cloudinary backend API base URL is not configured.');
  }

  const endpoint = new URL(`${baseUrl}/${pathName.replace(/^\//, '')}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      endpoint.searchParams.set(key, String(value));
    }
  });

  return endpoint.toString();
};

if (typeof window !== 'undefined') {
  window.__cloudinaryApiCallLog = getCloudinaryApiCallLog;
  window.__clearCloudinaryApiCallLog = clearCloudinaryApiCallLog;
}

const fetchFromBackendGalleryApi = async (folderPath) => {
  const url = buildBackendUrl('cloudinary/gallery', { folderPath });
  const response = await fetch(url);

  if (!response.ok) {
    recordCloudinaryApiCall({
      source: 'backend-gallery',
      folderPath,
      url,
      ok: false,
      status: response.status,
      count: 0,
      error: `Backend gallery request failed with status ${response.status}`,
    });
    throw new Error(`Backend gallery request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const publicIds = Array.isArray(payload?.publicIds)
    ? payload.publicIds.map((value) => String(value || '').trim()).filter(Boolean)
    : [];

  recordCloudinaryApiCall({
    source: 'backend-gallery',
    folderPath,
    url,
    ok: true,
    status: response.status,
    count: publicIds.length,
    error: '',
  });

  return [...new Set(publicIds)].sort((left, right) => left.localeCompare(right));
};

export const fetchCloudinaryFolders = async (prefix = '') => {
  const url = buildBackendUrl('cloudinary/folders', { prefix });
  const response = await fetch(url);

  if (!response.ok) {
    recordCloudinaryApiCall({
      source: 'backend-folders',
      folderPath: prefix,
      url,
      ok: false,
      status: response.status,
      count: 0,
      error: `Backend folders request failed with status ${response.status}`,
    });
    throw new Error(`Backend folders request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const folders = Array.isArray(payload?.folders)
    ? payload.folders.map((value) => String(value || '').trim()).filter(Boolean)
    : [];

  recordCloudinaryApiCall({
    source: 'backend-folders',
    folderPath: prefix,
    url,
    ok: true,
    status: response.status,
    count: folders.length,
    error: '',
  });

  return [...new Set(folders)].sort((left, right) => left.localeCompare(right));
};

const encodePublicId = (publicId) =>
  String(publicId)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

export const buildCloudinaryImageUrl = (publicId, options = {}) => {
  if (!publicId) return '';

  const width = options.width || DEFAULT_WIDTH;
  const quality = options.quality || DEFAULT_QUALITY;
  const format = options.format || DEFAULT_FORMAT;
  const crop = options.crop || 'fill';
  const gravity = options.gravity || 'auto';

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_${format},q_${quality},w_${width},c_${crop},g_${gravity}/${encodePublicId(publicId)}`;
};

export const buildCloudinarySrcSet = (publicId, widths = [480, 768, 1024, 1440, 1920]) => {
  if (!publicId) return '';

  return widths
    .map((width) => `${buildCloudinaryImageUrl(publicId, { width })} ${width}w`)
    .join(', ');
};

const normalizeCloudinaryListResponse = (response) => {
  const resources = Array.isArray(response?.resources) ? response.resources : [];

  return resources
    .map((resource) => String(resource?.public_id || '').trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
};

const fetchFromProxyApi = async (folderPath) => {
  if (!CLOUDINARY_GALLERY_API_URL || !folderPath) {
    return [];
  }

  const endpoint = new URL(CLOUDINARY_GALLERY_API_URL);
  endpoint.searchParams.set('folderPath', folderPath);

  const url = endpoint.toString();
  const response = await fetch(url);

  if (!response.ok) {
    recordCloudinaryApiCall({
      source: 'proxy',
      folderPath,
      url,
      ok: false,
      status: response.status,
      count: 0,
      error: `Gallery API failed with status ${response.status}`,
    });
    throw new Error(`Gallery API failed with status ${response.status}`);
  }

  const payload = await response.json();
  const publicIds = Array.isArray(payload?.publicIds)
    ? payload.publicIds
    : Array.isArray(payload?.resources)
      ? payload.resources.map((resource) => resource?.public_id)
      : [];

  const normalizedPublicIds = publicIds
    .map((id) => String(id || '').trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));

  recordCloudinaryApiCall({
    source: 'proxy',
    folderPath,
    url,
    ok: true,
    status: response.status,
    count: normalizedPublicIds.length,
    error: '',
  });

  return normalizedPublicIds;
};

const fetchFromCloudinaryListEndpoint = async (folderPath) => {
  if (!folderPath) {
    return [];
  }

  const listUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${encodeURIComponent(folderPath)}.json`;
  const response = await fetch(listUrl);

  if (!response.ok) {
    recordCloudinaryApiCall({
      source: 'cloudinary-list',
      folderPath,
      url: listUrl,
      ok: false,
      status: response.status,
      count: 0,
      error: `Cloudinary list request failed with status ${response.status}`,
    });
    throw new Error(`Cloudinary list request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const publicIds = normalizeCloudinaryListResponse(payload);

  recordCloudinaryApiCall({
    source: 'cloudinary-list',
    folderPath,
    url: listUrl,
    ok: true,
    status: response.status,
    count: publicIds.length,
    error: '',
  });

  return publicIds;
};

export const fetchCloudinaryFolderPublicIds = async (folderPath) => {
  const errors = [];
  const canUseBackendApi =
    Boolean(CLOUDINARY_API_BASE_URL) ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost');

  if (canUseBackendApi) {
    try {
      return await fetchFromBackendGalleryApi(folderPath);
    } catch (error) {
      errors.push(error);
    }
  }

  try {
    return await fetchFromCloudinaryListEndpoint(folderPath);
  } catch (error) {
    errors.push(error);
  }

  if (CLOUDINARY_GALLERY_API_URL) {
    try {
      return await fetchFromProxyApi(folderPath);
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length) {
    throw new Error(errors.map((error) => error?.message || 'Unknown gallery error').join(' | '));
  }

  return [];
};
