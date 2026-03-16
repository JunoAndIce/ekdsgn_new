const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo';
const DEFAULT_WIDTH = 1400;
const DEFAULT_QUALITY = 'auto';
const DEFAULT_FORMAT = 'auto';

const encodePublicId = (publicId) =>
  String(publicId)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

export const buildCloudinaryImageUrl = (publicId, options = {}) => {
  if (!publicId) return '';

  const width = options.width || DEFAULT_WIDTH;
  const quality = options.quality || DEFAULT_QUALITY;
  const format = options.format || DEFAULT_FORMAT;
  const crop = options.crop || 'fill';
  const gravity = options.gravity || 'auto';

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_${format},q_${quality},w_${width},c_${crop},g_${gravity}/${encodePublicId(publicId)}`;
};

export const buildCloudinarySrcSet = (publicId, widths = [480, 768, 1024, 1440, 1920]) => {
  if (!publicId) return '';

  return widths
    .map((width) => `${buildCloudinaryImageUrl(publicId, { width })} ${width}w`)
    .join(', ');
};
