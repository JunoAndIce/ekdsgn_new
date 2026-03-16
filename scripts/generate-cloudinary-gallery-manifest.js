const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { buildGalleryManifest, getCloudinaryAdminConfigFromEnv } = require('./cloudinaryAdmin');

const rootDir = path.resolve(__dirname, '..');
const projectsPath = path.join(rootDir, 'src', 'data', 'projects.json');
const manifestPath = path.join(rootDir, 'src', 'data', 'cloudinaryGalleryManifest.json');
const envPath = path.join(rootDir, '.env');

const loadLocalEnvFile = () => {
  if (!fsSync.existsSync(envPath)) {
    return;
  }

  const envContents = fsSync.readFileSync(envPath, 'utf8');
  const lines = envContents.split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = String(line || '').trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const equalsIndex = trimmed.indexOf('=');

    if (equalsIndex <= 0) {
      return;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();

    if (!key || process.env[key]) {
      return;
    }

    process.env[key] = value;
  });
};

const run = async () => {
  loadLocalEnvFile();

  const projectsRaw = await fs.readFile(projectsPath, 'utf8');
  const projects = JSON.parse(projectsRaw);

  const config = getCloudinaryAdminConfigFromEnv(process.env);
  const manifest = await buildGalleryManifest({ projects, config });

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const galleryCount = Object.keys(manifest.galleries).length;
  const imageCount = Object.values(manifest.galleries).reduce((sum, ids) => sum + ids.length, 0);

  console.log(`Generated ${galleryCount} galleries with ${imageCount} images total.`);
  console.log(`Wrote ${manifestPath}`);
};

run().catch((error) => {
  console.error('Failed to generate Cloudinary gallery manifest.');
  console.error(error?.message || error);
  process.exit(1);
});
