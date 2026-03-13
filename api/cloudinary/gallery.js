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

const postCloudinarySearch = async ({ folderPath, nextCursor }) => {
  const body = {
    expression: `folder="${folderPath}"`,
    max_results: 500,
  };

  if (nextCursor) {
    body.next_cursor = nextCursor;
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
    method: 'POST',
    headers: {
      Authorization: buildAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary search failed (${response.status}): ${text}`);
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

  const folderPath = String(req.query.folderPath || '').trim();

  if (!folderPath) {
    sendJson(res, 400, { error: 'Missing required folderPath query parameter.' });
    return;
  }

  try {
    const ids = [];
    let nextCursor = null;

    // Paginate through all assets in the folder so frontend can render complete galleries.
    do {
      const payload = await postCloudinarySearch({ folderPath, nextCursor });
      const resources = Array.isArray(payload?.resources) ? payload.resources : [];

      resources.forEach((resource) => {
        const rawId = String(resource?.public_id || '').trim();

        if (!rawId) {
          return;
        }

        // Cloudinary search may return public IDs without the folder prefix
        // when the account uses fixed-folder mode. Normalize to always include it.
        const publicId =
          rawId.startsWith(folderPath + '/') || rawId.startsWith(folderPath)
            ? rawId
            : `${folderPath}/${rawId}`;

        ids.push(publicId);
      });

      nextCursor = payload?.next_cursor || null;
    } while (nextCursor);

    const publicIds = [...new Set(ids)].sort((left, right) => left.localeCompare(right));

    sendJson(res, 200, {
      source: 'cloudinary-admin-search',
      folderPath,
      count: publicIds.length,
      publicIds,
    });
  } catch (error) {
    sendJson(res, 502, {
      error: error?.message || 'Failed to fetch Cloudinary folder assets.',
      folderPath,
    });
  }
};
