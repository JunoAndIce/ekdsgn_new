import { buildCloudinaryImageUrl } from '../lib/cloudinary';

export const imagePublicIds = {
  headerLogo: 'ekdsgn/branding/ek-header-logo',
  footerLogo: 'ekdsgn/branding/ek-footer-logo',
};

export const resolveCloudinaryImageUrl = (publicId, options = {}) =>
  publicId ? buildCloudinaryImageUrl(publicId, options) : '';
