/** Sized webp variants of an accommodation image; the number is the longest side in px. */
export interface ImageUrls {
  small: string;
  medium: string;
  large: string;
  original: string;
}

export interface ResponsiveImageAttributes {
  src: string;
  srcset?: string;
  sizes?: string;
}

/**
 * The `<img>` attributes for an accommodation image, or null when there is
 * no image at all. Falls back to the plain `image_url` on backends that do
 * not send `image_urls` yet.
 */
export function responsiveImage(
  imageUrl: string | null,
  imageUrls: ImageUrls | null | undefined,
  sizes: string
): ResponsiveImageAttributes | null {
  if (imageUrls) {
    return {
      src: imageUrls.large,
      srcset: `${imageUrls.small} 480w, ${imageUrls.medium} 960w, ${imageUrls.large} 1600w`,
      sizes
    };
  }

  return imageUrl ? { src: imageUrl } : null;
}
