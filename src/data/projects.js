import projectsData from './projects.json';

export const projectCards = projectsData
  .map((project) => ({
    id: String(project.id || '').trim(),
    title: String(project.title || '').trim(),
    meta: String(project.meta || '').trim(),
    description: String(project.description || '').trim(),
    category: String(project.category || 'all').trim(),
    featured: Boolean(project.featured),
    tags: Array.isArray(project.tags) ? project.tags.map((tag) => String(tag || '').trim()).filter(Boolean) : [],
    publicIds: Array.isArray(project.publicIds)
      ? project.publicIds.map((id) => String(id || '').trim()).filter(Boolean)
      : [],
    folderPath: String(project.folderPath || '').trim(),
    fallbackPublicId: String(project.fallbackPublicId || '').trim(),
    placeholderIcon: String(project.placeholderIcon || '').trim(),
    placeholderClass: String(project.placeholderClass || '').trim(),
  }))
  .filter((project) => project.id && project.title && (project.folderPath || project.publicIds.length));

export const projectsById = Object.fromEntries(
  projectCards.map((project) => [project.id, project])
);

export const defaultProjectKey = projectCards[0]?.id || '';

export const featuredProjectOrder = projectCards
  .filter((project) => project.featured)
  .map((project) => project.id);

export const categoryDefinitions = [
  { id: 'creative-direction', label: 'Creative Direction', emoji: '🎬' },
  { id: 'graphic-design', label: 'Graphic Design', emoji: '✏️' },
  { id: 'videography', label: 'Videography', emoji: '📽️' },
  { id: 'logos', label: 'Logos', emoji: '⬡' },
];

export const projectsBySection = categoryDefinitions.map((category) => ({
  ...category,
  items: projectCards.filter((project) => project.category === category.id),
})).filter((category) => category.items.length > 0);

export default projectCards;
