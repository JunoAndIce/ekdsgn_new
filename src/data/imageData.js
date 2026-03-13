import { buildCloudinaryImageUrl } from '../lib/cloudinary';

export const imagePublicIds = {
  headerLogo: 'ekdsgn/branding/ek-header-logo',
  footerLogo: 'ekdsgn/branding/ek-footer-logo',
  bottega: 'ek/creativedir/bottegadesires',
  select: 'ekdsgn/projects/selectqb',
  mcmurry: 'ekdsgn/projects/mcmurry',
  txst: 'ekdsgn/projects/txst',
  ek: 'ekdsgn/branding/ek-mark',
  powerade: 'ek/creativedir/powerade',
  '6athletics': 'ek/creativedir/6athletics',
  '77Studios': 'ek/creativedir/77Studios',
};

export const resolveCloudinaryPublicId = (imageRef) =>
  imageRef ? imagePublicIds[imageRef] || imageRef : null;

export const resolveCloudinaryImageUrl = (imageRef, options = {}) => {
  const publicId = resolveCloudinaryPublicId(imageRef);

  return publicId ? buildCloudinaryImageUrl(publicId, options) : '';
};
