const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { buildCloudinaryProjectsSnapshot, getCloudinaryAdminConfigFromEnv } = require('./cloudinaryAdmin');

const rootDir = path.resolve(__dirname, '..');
const generatedProjectsPath = path.join(rootDir, 'src', 'data', 'cloudinaryProjects.json');
const envPath = path.join(rootDir, '.env');

const isRateLimitedError = (error) => {
  const message = String(error?.message || error || '').toLowerCase();
  return message.includes('rate limit') || message.includes('429') || message.includes('420');
};

const readPreviousSnapshot = async () => {
  if (!fsSync.existsSync(generatedProjectsPath)) {
    return null;
  }

  try {
    const existing = await fs.readFile(generatedProjectsPath, 'utf8');
    const parsed = JSON.parse(existing);
    const projects = Array.isArray(parsed?.projects) ? parsed.projects : [];

    if (!projects.length) {
      return null;
    }

    return {
      generatedAt: String(parsed?.generatedAt || '').trim(),
      projectCount: projects.length,
    };
  } catch (_error) {
    return null;
  }
};

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
  const generatedProjects = {
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
    projectPrefix: snapshot.projectPrefix,
    projects: snapshot.projects,
  };

  await fs.writeFile(generatedProjectsPath, `${JSON.stringify(generatedProjects, null, 2)}\n`, 'utf8');

  const folderCount = snapshot.folders.length;
  const galleryCount = Object.keys(snapshot.galleries).length;
  const projectCount = snapshot.projects.length;
  const imageCount = Object.values(snapshot.galleries).reduce((sum, ids) => sum + ids.length, 0);

  console.log(`Discovered ${folderCount} folders and generated ${projectCount} projects.`);
  console.log(`Generated ${galleryCount} galleries with ${imageCount} images total.`);
  console.log(`Wrote ${generatedProjectsPath}`);
};

run().catch((error) => {
  if (isRateLimitedError(error)) {
    readPreviousSnapshot()
      .then((previous) => {
        if (previous) {
          const when = previous.generatedAt ? ` from ${previous.generatedAt}` : '';
          console.warn('Cloudinary API rate limit detected.');
          console.warn(`Using existing snapshot${when} with ${previous.projectCount} projects.`);
          process.exit(0);
          return;
        }

        console.error('Cloudinary API rate limit detected, and no previous snapshot is available.');
        console.error(error?.message || error);
        process.exit(1);
      })
      .catch(() => {
        console.error('Cloudinary API rate limit detected, and previous snapshot fallback failed.');
        console.error(error?.message || error);
        process.exit(1);
      });
    return;
  }

  console.error('Failed to generate Cloudinary projects snapshot.');
  console.error(error?.message || error);
  process.exit(1);
});
