import React, { forwardRef } from 'react';
import { buildCloudinaryImageUrl, buildCloudinarySrcSet } from '../../lib/cloudinary';

const ResponsiveImage = forwardRef(({
  publicId,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, 50vw',
  width = 1400,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  style,
}, ref) => {
  if (!publicId) return null;

  return (
    <img
      ref={ref}
      className={className}
      src={buildCloudinaryImageUrl(publicId, { width })}
      srcSet={buildCloudinarySrcSet(publicId)}
      sizes={sizes}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      style={style}
    />
  );
});

export default ResponsiveImage;
