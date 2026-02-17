/**
 * Image optimization utility for Cloudinary URLs
 * Automatically optimizes images with auto format, quality, and width
 */

export const optimizeCloudinaryImage = (url, options = {}) => {
  if (!url) return url;

  // If not a Cloudinary URL, return as-is
  if (!url.includes('cloudinary')) {
    return url;
  }

  const {
    width = 'auto',
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;

  // Parse URL and insert transformation
  try {
    // Match Cloudinary URL structure
    const cloudinaryRegex = /https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.*)$/;
    const match = url.match(cloudinaryRegex);

    if (match) {
      const [, cloudName, rest] = match;

      // Build transformation string
      const transformations = [];
      
      if (width && width !== 'auto') {
        transformations.push(`w_${width}`);
      }

      if (quality !== 'auto') {
        transformations.push(`q_${quality}`);
      } else {
        transformations.push('q_auto');
      }

      if (format !== 'auto') {
        transformations.push(`f_${format}`);
      } else {
        transformations.push('f_auto');
      }

      if (crop) {
        transformations.push(`c_${crop}`);
      }

      const transformationString = transformations.join(',');
      return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${rest}`;
    }
  } catch (error) {
    console.warn('Error optimizing Cloudinary URL:', error);
  }

  return url;
};

/**
 * Generate responsive image srcset for different screen sizes
 */
export const generateResponsiveImageSrcSet = (url, widths = [320, 640, 960, 1280]) => {
  return widths
    .map(w => `${optimizeCloudinaryImage(url, { width: w })} ${w}w`)
    .join(', ');
};

/**
 * Get optimized image URL with sane defaults for product images
 */
export const getOptimizedProductImage = (url, width = 500) => {
  return optimizeCloudinaryImage(url, {
    width,
    quality: 'auto',
    format: 'auto',
    crop: 'fill',
  });
};

/**
 * Get optimized image URL for thumbnails
 */
export const getOptimizedThumbnail = (url) => {
  return optimizeCloudinaryImage(url, {
    width: 200,
    quality: 85,
    format: 'auto',
    crop: 'fill',
  });
};

/**
 * Get optimized image URL for hero/banner images
 */
export const getOptimizedHeroImage = (url) => {
  return optimizeCloudinaryImage(url, {
    width: 1280,
    quality: 'auto',
    format: 'auto',
    crop: 'fill',
  });
};

export default optimizeCloudinaryImage;
