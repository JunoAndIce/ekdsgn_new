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

const postAdminJson = async (url, body, config) => {
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: getAdminAuthorizationHeader(config),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudinary Admin API request failed (${response.status}). ${errorBody.slice(0, 300)}`);
  }

  return response.json();
};

const escapeSearchValue = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const fetchText = async (url) => {
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    return '';
  }

  return response.text();
};

const listCloudinaryFoldersPage = async (config, options = {}) => {
  const normalizedPrefix = String(options.prefix || '').trim().replace(/^\/+|\/+$/g, '');
  const normalizedCursor = String(options.nextCursor || '').trim();
  const url = new URL(`${CLOUDINARY_API_BASE_URL}/${encodeURIComponent(config.cloudName)}/folders`);
  url.searchParams.set('max_results', String(MAX_RESULTS));

  if (normalizedPrefix) {
    url.searchParams.set('prefix', normalizedPrefix);
  }

  if (normalizedCursor) {
    url.searchParams.set('next_cursor', normalizedCursor);
  }

  const payload = await fetchAdminJson(url, config);
  const folders = (Array.isArray(payload?.folders) ? payload.folders : [])
    .map((folder) => String(folder?.path || '').trim().replace(/^\/+|\/+$/g, ''))
    .filter(Boolean);

  return {
    folders,
    nextCursor: String(payload?.next_cursor || '').trim(),
  };
};

const listCloudinaryFoldersByPrefix = async (config, prefix = '') => {
  const folders = [];
  let nextCursor = '';

  do {
    const page = await listCloudinaryFoldersPage(config, { prefix, nextCursor });
    folders.push(...page.folders);
    nextCursor = page.nextCursor;
  } while (nextCursor);

  return Array.from(new Set(folders)).sort((left, right) => left.localeCompare(right));
};

const listCloudinaryFolders = async (config, options = {}) => {
  const normalizedPrefix = String(options.prefix || '').trim().replace(/^\/+|\/+$/g, '');
  const discovered = new Set();
  const queue = [];

  if (normalizedPrefix) {
    discovered.add(normalizedPrefix);
    queue.push(normalizedPrefix);
  } else {
    const rootFolders = await listCloudinaryFoldersByPrefix(config, '');
    rootFolders.forEach((folderPath) => {
      discovered.add(folderPath);
      queue.push(folderPath);
    });
  }

  while (queue.length) {
    const parentFolder = queue.shift();
    const childFolders = await listCloudinaryFoldersByPrefix(config, `${parentFolder}/`);

    childFolders.forEach((folderPath) => {
      if (!folderPath || discovered.has(folderPath)) {
        return;
      }

      if (normalizedPrefix && folderPath !== normalizedPrefix && !folderPath.startsWith(`${normalizedPrefix}/`)) {
        return;
      }

      discovered.add(folderPath);
      queue.push(folderPath);
    });
  }

  return Array.from(discovered).sort((left, right) => left.localeCompare(right));
};

const listAllImageResources = async (config) => {
  const resources = [];
  let nextCursor = '';

  do {
    const url = new URL(`${CLOUDINARY_API_BASE_URL}/${encodeURIComponent(config.cloudName)}/resources/search`);
    const payload = await postAdminJson(
      url,
      {
        expression: 'resource_type:image',
        max_results: MAX_RESULTS,
        next_cursor: nextCursor || undefined,
      },
      config
    );
    const pageResources = Array.isArray(payload?.resources) ? payload.resources : [];

    pageResources.forEach((resource) => {
      const publicId = String(resource?.public_id || '').trim();
      const assetFolder = String(resource?.asset_folder || '').trim();
      const folder = String(resource?.folder || '').trim();

      if (!publicId && !assetFolder && !folder) {
        return;
      }

      resources.push({
        publicId,
        assetFolder,
        folder,
      });
    });

    nextCursor = String(payload?.next_cursor || '').trim();
  } while (nextCursor);

  return resources;
};

const extractFolderPathsFromResources = (resources, prefix = '') => {
  const normalizedPrefix = String(prefix || '').trim().replace(/^\/+|\/+$/g, '');

  return Array.from(
    new Set(
      (Array.isArray(resources) ? resources : [])
        .map((resource) => {
          const assetFolder = String(resource?.assetFolder || '').trim().replace(/^\/+|\/+$/g, '');
          if (assetFolder) {
            return assetFolder;
          }

          const folder = String(resource?.folder || '').trim().replace(/^\/+|\/+$/g, '');
          if (folder) {
            return folder;
          }

          const value = String(resource?.publicId || '').trim();
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
    const url = new URL(`${CLOUDINARY_API_BASE_URL}/${encodeURIComponent(config.cloudName)}/resources/search`);
    const payload = await postAdminJson(
      url,
      {
        expression: `resource_type:image AND (asset_folder="${normalizedFolderPath}" OR folder="${normalizedFolderPath}")`,
        max_results: MAX_RESULTS,
        next_cursor: nextCursor || undefined,
      },
      config
    );
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

const listCloudinaryFolderResources = async (folderPath, config) => {
  const normalizedFolderPath = String(folderPath || '').trim().replace(/^\/+|\/+$/g, '');

  if (!normalizedFolderPath) {
    return [];
  }

  const resources = [];
  let nextCursor = '';

  do {
    const url = new URL(`${CLOUDINARY_API_BASE_URL}/${encodeURIComponent(config.cloudName)}/resources/search`);
    const payload = await postAdminJson(
      url,
      {
        expression: `(asset_folder="${escapeSearchValue(normalizedFolderPath)}" OR folder="${escapeSearchValue(normalizedFolderPath)}")`,
        max_results: MAX_RESULTS,
        next_cursor: nextCursor || undefined,
      },
      config
    );
    const pageResources = Array.isArray(payload?.resources) ? payload.resources : [];

    pageResources.forEach((resource) => {
      const publicId = String(resource?.public_id || '').trim();
      const secureUrl = String(resource?.secure_url || '').trim();
      const rawUrl = String(resource?.url || '').trim();
      const format = String(resource?.format || '').trim().toLowerCase();
      const resourceType = String(resource?.resource_type || '').trim().toLowerCase();

      if (!publicId) {
        return;
      }

      resources.push({
        publicId,
        secureUrl,
        rawUrl,
        format,
        resourceType,
      });
    });

    nextCursor = String(payload?.next_cursor || '').trim();
  } while (nextCursor);

  return resources;
};

const parseProjectInfoText = (contents) => {
  const text = String(contents || '').replace(/^\uFEFF/, '').trim();

  if (!text) {
    return {
      title: '',
      description: '',
    };
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => String(line || '').trim())
    .filter(Boolean);

  let title = '';
  let description = '';
  const remainder = [];

  lines.forEach((line) => {
    const match = line.match(/^([a-zA-Z][a-zA-Z\s_-]{1,30})\s*:\s*(.+)$/);

    if (!match) {
      remainder.push(line);
      return;
    }

    const key = match[1].trim().toLowerCase().replace(/\s+/g, '');
    const value = match[2].trim();

    if (!value) {
      return;
    }

    if (!title && ['name', 'title', 'project', 'projectname'].includes(key)) {
      title = value;
      return;
    }

    if (!description && ['description', 'desc', 'summary', 'about'].includes(key)) {
      description = value;
      return;
    }

    remainder.push(line);
  });

  if (!title && remainder.length > 0) {
    [title] = remainder;
  }

  if (!description && remainder.length > 1) {
    description = remainder.slice(title ? 1 : 0).join(' ');
  }

  return {
    title: String(title || '').trim(),
    description: String(description || '').trim(),
  };
};

const loadProjectInfoFromFolder = async (folderPath, config) => {
  const folderResources = await listCloudinaryFolderResources(folderPath, config);

  if (!folderResources.length) {
    return {
      title: '',
      description: '',
    };
  }

  const infoCandidates = folderResources
    .filter((resource) => resource.resourceType === 'raw' || resource.format === 'txt')
    .filter((resource) => {
      const parts = String(resource.publicId || '').split('/').filter(Boolean);
      const fileName = String(parts[parts.length - 1] || '').toLowerCase();
      return fileName === 'info' || fileName === 'info.txt' || /^info([._-].+)?$/.test(fileName);
    });

  const selectedResource = infoCandidates[0];

  if (!selectedResource) {
    return {
      title: '',
      description: '',
    };
  }

  const downloadUrl = selectedResource.secureUrl || selectedResource.rawUrl;

  if (!downloadUrl) {
    return {
      title: '',
      description: '',
    };
  }

  const text = await fetchText(downloadUrl);
  return parseProjectInfoText(text);
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

const deriveProjectFromFolder = (folderPath, publicIds, index, info = {}) => {
  const segments = String(folderPath || '').split('/').filter(Boolean);
  const folderName = segments[segments.length - 1] || `folder-${index + 1}`;
  const groupSegment = segments.length > 1 ? segments[1] : segments[0] || 'cloudinary';
  const groupLabel = toTitleCase(groupSegment) || 'Cloudinary';
  const category = toSlug(groupSegment) || 'cloudinary';
  const id = toSlug(folderPath.replace(/\//g, '-')) || `project-${index + 1}`;
  const parsedTitle = String(info?.title || '').trim();
  const parsedDescription = String(info?.description || '').trim();
  const title = parsedTitle || toTitleCase(folderName) || `Project ${index + 1}`;
  const tags = [groupLabel, 'Cloudinary'];

  return {
    id,
    category,
    featured: index < 6,
    title,
    groupName: groupLabel,
    meta: groupLabel,
    description: parsedDescription || `${groupLabel} project gallery`,
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
  const allImageResources = await listAllImageResources(config);
  const folderPathsFromAssets = extractFolderPathsFromResources(allImageResources, prefix);
  const folderPaths = Array.from(new Set([...folderPathsFromApi, ...folderPathsFromAssets]))
    .sort((left, right) => left.localeCompare(right));
  const galleries = {};
  const projects = [];

  for (let index = 0; index < folderPaths.length; index += 1) {
    const folderPath = folderPaths[index];
    const publicIds = await listCloudinaryFolderPublicIds(folderPath, config);
    const projectInfo = await loadProjectInfoFromFolder(folderPath, config);
    galleries[folderPath] = publicIds;

    if (!includeEmptyFolders && publicIds.length === 0) {
      continue;
    }

    projects.push(deriveProjectFromFolder(folderPath, publicIds, index, projectInfo));
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
