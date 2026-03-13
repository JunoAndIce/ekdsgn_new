const getEnv = (name) => process.env[name] || '';

const CLOUD_NAME = getEnv('CLOUDINARY_CLOUD_NAME');
const API_KEY = getEnv('CLOUDINARY_API_KEY');
const API_SECRET = getEnv('CLOUDINARY_API_SECRET');

const buildAuthHeader = () =>
  `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`;

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const validateServerConfig = () => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return 'Missing Cloudinary backend environment variables.';
  }

  return '';
};

const fetchFoldersPage = async ({ nextCursor }) => {
  const params = new URLSearchParams({ max_results: '500' });

  if (nextCursor) {
    params.set('next_cursor', nextCursor);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/folders?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: buildAuthHeader(),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary folders request failed (${response.status}): ${text}`);
  }

  return response.json();
};

module.exports = async (req, res) => {
  // CORS allows static frontend origins (GH Pages) to query this backend endpoint.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const configError = validateServerConfig();

  if (configError) {
    sendJson(res, 500, { error: configError });
    return;
  }

  const prefix = String(req.query.prefix || '').trim();

  try {
    const folders = [];
    let nextCursor = null;

    // Read every folders page so the frontend can build a complete folder index.
    do {
      const payload = await fetchFoldersPage({ nextCursor });
      const pageFolders = Array.isArray(payload?.folders) ? payload.folders : [];

      pageFolders.forEach((folder) => {
        const path = String(folder?.path || '').trim();

        if (!path) {
          return;
        }

        if (prefix && !path.startsWith(prefix)) {
          return;
        }

        folders.push(path);
      });

      nextCursor = payload?.next_cursor || null;
    } while (nextCursor);

    const uniqueFolders = [...new Set(folders)].sort((left, right) => left.localeCompare(right));

    sendJson(res, 200, {
      source: 'cloudinary-admin-folders',
      prefix,
      count: uniqueFolders.length,
      folders: uniqueFolders,
    });
  } catch (error) {
    sendJson(res, 502, {
      error: error?.message || 'Failed to fetch Cloudinary folders.',
      prefix,
    });
  }
};
