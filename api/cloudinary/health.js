module.exports = async (req, res) => {
  // Simple health endpoint for quickly verifying Vercel deployment and env wiring.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      ok: true,
      service: 'cloudinary-backend',
      hasCloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
      hasApiKey: Boolean(process.env.CLOUDINARY_API_KEY),
      hasApiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
      timestamp: new Date().toISOString(),
    })
  );
};
