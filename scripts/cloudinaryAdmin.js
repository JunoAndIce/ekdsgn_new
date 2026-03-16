const { Buffer } = require('buffer');

const CLOUDINARY_API_BASE_URL = 'https://api.cloudinary.com/v1_1';
const MAX_RESULTS = 500;

const toSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toTitleCase = (value) =>
  String(value || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const decodeApiSecretFromBase64 = (encodedSecret) => {
  const normalizedSecret = String(encodedSecret || '').trim();

  if (!normalizedSecret) {
    throw new Error('Missing CLOUDINARY_API_SECRET_BASE64.');
  }

  const decodedSecret = Buffer.from(normalizedSecret, 'base64').toString('utf8').trim();

  if (!decodedSecret) {
    throw new Error('CLOUDINARY_API_SECRET_BASE64 could not be decoded.');
  }

  return decodedSecret;
};

const getCloudinaryAdminConfigFromEnv = (env = process.env) => {
  const cloudName = String(env.CLOUDINARY_CLOUD_NAME || env.REACT_APP_CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = String(env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = decodeApiSecretFromBase64(env.CLOUDINARY_API_SECRET_BASE64);

  if (!cloudName) {
    throw new Error('Missing CLOUDINARY_CLOUD_NAME.');
  }

  if (!apiKey) {
    throw new Error('Missing CLOUDINARY_API_KEY.');
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
};

const getAdminAuthorizationHeader = (config) => {
  const raw = `${config.apiKey}:${config.apiSecret}`;
  return `Basic ${Buffer.from(raw, 'utf8').toString('base64')}`;
};

const fetchAdminJson = async (url, config) => {
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: getAdminAuthorizationHeader(config),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudinary Admin API request failed (${response.status}). ${errorBody.slice(0, 300)}`);
  }

  return response.json();
};

const listCloudinaryFolders = async (config, options = {}) => {
  const normalizedPrefix = String(options.prefix || '').trim().replace(/^\/+|\/+$/g, '');
  const folders = [];
  let nextCursor = '';

  do {
    const url = new URL(`${CLOUDINARY_API_BASE_URL}/${encodeURIComponent(config.cloudName)}/folders`);
    url.searchParams.set('max_results', String(MAX_RESULTS));

    if (nextCursor) {
      url.searchParams.set('next_cursor', nextCursor);
    }

    const payload = await fetchAdminJson(url, config);
    const folderItems = Array.isArray(payload?.folders) ? payload.folders : [];

    folderItems.forEach((folder) => {
      const folderPath = String(folder?.path || '').trim().replace(/^\/+|\/+$/g, '');

      if (!folderPath) {
        return;
      }

      if (normalizedPrefix && folderPath !== normalizedPrefix && !folderPath.startsWith(`${normalizedPrefix}/`)) {
        return;
      }

      folders.push(folderPath);
    });

    nextCursor = String(payload?.next_cursor || '').trim();
  } while (nextCursor);

  return Array.from(new Set(folders)).sort((left, right) => left.localeCompare(right));
};

const listAllImagePublicIds = async (config) => {
  const publicIds = [];
  let nextCursor = '';

  do {
    const url = new URL(`${CLOUDINARY_API_BASE_URL}/${encodeURIComponent(config.cloudName)}/resources/image/upload`);
    url.searchParams.set('max_results', String(MAX_RESULTS));

    if (nextCursor) {
      url.searchParams.set('next_cursor', nextCursor);
    }

    const payload = await fetchAdminJson(url, config);
    const resources = Array.isArray(payload?.resources) ? payload.resources : [];

    resources.forEach((resource) => {
      const publicId = String(resource?.public_id || '').trim();
      if (publicId) {
        publicIds.push(publicId);
      }
    });

    nextCursor = String(payload?.next_cursor || '').trim();
  } while (nextCursor);

  return Array.from(new Set(publicIds)).sort((left, right) => left.localeCompare(right));
};

const extractFolderPathsFromPublicIds = (publicIds, prefix = '') => {
  const normalizedPrefix = String(prefix || '').trim().replace(/^\/+|\/+$/g, '');

  return Array.from(
    new Set(
      (Array.isArray(publicIds) ? publicIds : [])
        .map((publicId) => {
          const value = String(publicId || '').trim();
          const splitIndex = value.lastIndexOf('/');
          if (splitIndex <= 0) {
            return '';
          }
          return value.slice(0, splitIndex);
        })
        .filter((folderPath) => {
          if (!folderPath) {
            return false;
          }
          if (!normalizedPrefix) {
            return true;
          }
          return folderPath === normalizedPrefix || folderPath.startsWith(`${normalizedPrefix}/`);
        })
    )
  ).sort((left, right) => left.localeCompare(right));
};

const listCloudinaryFolderPublicIds = async (folderPath, config) => {
  const normalizedFolderPath = String(folderPath || '').trim().replace(/^\/+|\/+$/g, '');

  if (!normalizedFolderPath) {
    return [];
  }

  const publicIdSet = new Set();
  let nextCursor = '';

  do {
    const url = new URL(`${CLOUDINARY_API_BASE_URL}/${encodeURIComponent(config.cloudName)}/resources/image/upload`);
    url.searchParams.set('prefix', `${normalizedFolderPath}/`);
    url.searchParams.set('max_results', String(MAX_RESULTS));

    if (nextCursor) {
      url.searchParams.set('next_cursor', nextCursor);
    }

    const payload = await fetchAdminJson(url, config);
    const resources = Array.isArray(payload?.resources) ? payload.resources : [];

    resources.forEach((resource) => {
      const publicId = String(resource?.public_id || '').trim();
      if (publicId) {
        publicIdSet.add(publicId);
      }
    });

    nextCursor = String(payload?.next_cursor || '').trim();
  } while (nextCursor);

  return Array.from(publicIdSet).sort((left, right) => left.localeCompare(right));
};

const buildGalleryManifest = async ({ folderPaths, config }) => {
  const normalizedFolderPaths = Array.from(
    new Set((Array.isArray(folderPaths) ? folderPaths : []).map((folderPath) => String(folderPath || '').trim()).filter(Boolean))
  );

  const galleries = {};

  for (const folderPath of normalizedFolderPaths) {
    galleries[folderPath] = await listCloudinaryFolderPublicIds(folderPath, config);
  }

  return {
    generatedAt: new Date().toISOString(),
    source: 'cloudinary-admin-api',
    galleries,
  };
};

const deriveProjectFromFolder = (folderPath, publicIds, index) => {
  const segments = String(folderPath || '').split('/').filter(Boolean);
  const folderName = segments[segments.length - 1] || `folder-${index + 1}`;
  const categoryRaw = segments.length > 1 ? segments[segments.length - 2] : 'cloudinary';
  const category = toSlug(categoryRaw) || 'cloudinary';
  const id = toSlug(folderPath.replace(/\//g, '-')) || `project-${index + 1}`;
  const title = toTitleCase(folderName) || `Project ${index + 1}`;
  const tags = segments.map((segment) => toTitleCase(segment)).filter(Boolean);

  return {
    id,
    category,
    featured: index < 6,
    title,
    meta: folderPath,
    description: `Auto-generated from Cloudinary folder: ${folderPath}`,
    tags,
    publicIds,
    folderPath,
    fallbackPublicId: publicIds[0] || '',
    placeholderIcon: '✦',
    placeholderClass: '',
  };
};

const buildCloudinaryProjectsSnapshot = async ({ config, prefix = '', includeEmptyFolders = false }) => {
  const folderPathsFromApi = await listCloudinaryFolders(config, { prefix });
  const allImagePublicIds = await listAllImagePublicIds(config);
  const folderPathsFromAssets = extractFolderPathsFromPublicIds(allImagePublicIds, prefix);
  const folderPaths = Array.from(new Set([...folderPathsFromApi, ...folderPathsFromAssets]))
    .sort((left, right) => left.localeCompare(right));
  const galleries = {};
  const projects = [];

  for (let index = 0; index < folderPaths.length; index += 1) {
    const folderPath = folderPaths[index];
    const publicIds = await listCloudinaryFolderPublicIds(folderPath, config);
    galleries[folderPath] = publicIds;

    if (!includeEmptyFolders && publicIds.length === 0) {
      continue;
    }

    projects.push(deriveProjectFromFolder(folderPath, publicIds, index));
  }

  return {
    generatedAt: new Date().toISOString(),
    source: 'cloudinary-admin-api',
    projectPrefix: String(prefix || '').trim(),
    folders: folderPaths,
    galleries,
    projects,
  };
};

module.exports = {
  getCloudinaryAdminConfigFromEnv,
  listCloudinaryFolders,
  listCloudinaryFolderPublicIds,
  buildGalleryManifest,
  buildCloudinaryProjectsSnapshot,
};
