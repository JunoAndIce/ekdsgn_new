import cloudinaryProjectsData from './cloudinaryProjects.json';

const rawProjects = Array.isArray(cloudinaryProjectsData?.projects)
  ? cloudinaryProjectsData.projects
  : [];

const toLabel = (value) => String(value || '')
  .split(/[-_\s]+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const categoryEmojiMap = {
  creativedir: '🎬',
  creative: '🎬',
  projects: '🗂️',
  videography: '📽️',
  graphic: '✏️',
  logos: '⬡',
  cloudinary: '☁️',
};

export const projectCards = rawProjects
  .map((project) => ({
    id: String(project.id || '').trim(),
    title: String(project.title || '').trim(),
    meta: String(project.meta || project.folderPath || '').trim(),
    description: String(project.description || '').trim(),
    category: String(project.category || 'cloudinary').trim(),
    featured: Boolean(project.featured),
    tags: Array.isArray(project.tags) ? project.tags.map((tag) => String(tag || '').trim()).filter(Boolean) : [],
    publicIds: Array.isArray(project.publicIds)
      ? project.publicIds.map((id) => String(id || '').trim()).filter(Boolean)
      : [],
    folderPath: String(project.folderPath || '').trim(),
    fallbackPublicId: String(project.fallbackPublicId || project.publicIds?.[0] || '').trim(),
    placeholderIcon: String(project.placeholderIcon || '').trim(),
    placeholderClass: String(project.placeholderClass || '').trim(),
  }))
  .filter((project) => project.id && project.title && project.publicIds.length > 0);

export const projectsById = Object.fromEntries(
  projectCards.map((project) => [project.id, project])
);

export const defaultProjectKey = projectCards[0]?.id || '';

const explicitFeaturedOrder = projectCards
  .filter((project) => project.featured)
  .map((project) => project.id);

export const featuredProjectOrder = explicitFeaturedOrder.length
  ? explicitFeaturedOrder
  : projectCards.slice(0, 6).map((project) => project.id);

const categoryIds = Array.from(new Set(projectCards.map((project) => project.category))).filter(Boolean);

export const categoryDefinitions = categoryIds.map((id) => ({
  id,
  label: toLabel(id),
  emoji: categoryEmojiMap[id] || '☁️',
}));

export const projectsBySection = categoryDefinitions.map((category) => ({
  ...category,
  items: projectCards.filter((project) => project.category === category.id),
})).filter((category) => category.items.length > 0);

export default projectCards;
