const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { buildCloudinaryProjectsSnapshot, getCloudinaryAdminConfigFromEnv } = require('./cloudinaryAdmin');

const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, 'src', 'data', 'cloudinaryGalleryManifest.json');
const generatedProjectsPath = path.join(rootDir, 'src', 'data', 'cloudinaryProjects.json');
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

  const config = getCloudinaryAdminConfigFromEnv(process.env);
  const prefix = String(process.env.CLOUDINARY_PROJECTS_PREFIX || '').trim();
  const includeEmptyFolders = String(process.env.CLOUDINARY_INCLUDE_EMPTY_FOLDERS || '').trim().toLowerCase() === 'true';
  const snapshot = await buildCloudinaryProjectsSnapshot({ config, prefix, includeEmptyFolders });
  const manifest = {
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
    galleries: snapshot.galleries,
  };
  const generatedProjects = {
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
    projectPrefix: snapshot.projectPrefix,
    projects: snapshot.projects,
  };

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await fs.writeFile(generatedProjectsPath, `${JSON.stringify(generatedProjects, null, 2)}\n`, 'utf8');

  const folderCount = snapshot.folders.length;
  const galleryCount = Object.keys(snapshot.galleries).length;
  const projectCount = snapshot.projects.length;
  const imageCount = Object.values(snapshot.galleries).reduce((sum, ids) => sum + ids.length, 0);

  console.log(`Discovered ${folderCount} folders and generated ${projectCount} projects.`);
  console.log(`Generated ${galleryCount} galleries with ${imageCount} images total.`);
  console.log(`Wrote ${manifestPath}`);
  console.log(`Wrote ${generatedProjectsPath}`);
};

run().catch((error) => {
  console.error('Failed to generate Cloudinary gallery manifest.');
  console.error(error?.message || error);
  process.exit(1);
});
