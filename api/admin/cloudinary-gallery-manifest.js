const crypto = require('crypto');
const { buildCloudinaryProjectsSnapshot, getCloudinaryAdminConfigFromEnv } = require('../../scripts/cloudinaryAdmin');

const isAuthorized = (request, secretToken) => {
  const authHeader = String(request.headers?.authorization || '');
  const providedToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!providedToken || !secretToken) {
    return false;
  }

  const left = Buffer.from(providedToken);
  const right = Buffer.from(secretToken);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const syncToken = String(process.env.CLOUDINARY_MANIFEST_SYNC_TOKEN || '').trim();

  if (!syncToken) {
    return res.status(500).json({ error: 'CLOUDINARY_MANIFEST_SYNC_TOKEN is not configured.' });
  }

  if (!isAuthorized(req, syncToken)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const config = getCloudinaryAdminConfigFromEnv(process.env);
    const prefix = String(process.env.CLOUDINARY_PROJECTS_PREFIX || '').trim();
    const includeEmptyFolders = String(process.env.CLOUDINARY_INCLUDE_EMPTY_FOLDERS || '').trim().toLowerCase() === 'true';
    const manifest = await buildCloudinaryProjectsSnapshot({ config, prefix, includeEmptyFolders });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(manifest);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to build Cloudinary gallery manifest.' });
  }
};
