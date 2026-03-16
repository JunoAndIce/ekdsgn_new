const { Buffer } = require('buffer');

const CLOUDINARY_API_BASE_URL = 'https://api.cloudinary.com/v1_1';
const MAX_RESULTS = 500;

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

    const payload = await response.json();
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

const buildGalleryManifest = async ({ projects, config }) => {
  const folderPaths = Array.from(
    new Set(
      (Array.isArray(projects) ? projects : [])
        .map((project) => String(project?.folderPath || '').trim())
        .filter(Boolean)
    )
  );

  const galleries = {};

  for (const folderPath of folderPaths) {
    galleries[folderPath] = await listCloudinaryFolderPublicIds(folderPath, config);
  }

  return {
    generatedAt: new Date().toISOString(),
    source: 'cloudinary-admin-api',
    galleries,
  };
};

module.exports = {
  getCloudinaryAdminConfigFromEnv,
  buildGalleryManifest,
};
