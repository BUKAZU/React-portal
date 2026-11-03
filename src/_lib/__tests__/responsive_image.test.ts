import { responsiveImage } from '../responsive_image';

const imageUrls = {
  small: 'https://cdn.example.com/img?variant=small',
  medium: 'https://cdn.example.com/img?variant=medium',
  large: 'https://cdn.example.com/img?variant=large',
  original: 'https://cdn.example.com/img'
};

describe('responsiveImage', () => {
  it('builds src, srcset and sizes from the variants', () => {
    expect(
      responsiveImage('https://cdn.example.com/img', imageUrls, '300px')
    ).toEqual({
      src: imageUrls.large,
      srcset: `${imageUrls.small} 480w, ${imageUrls.medium} 960w, ${imageUrls.large} 1600w`,
      sizes: '300px'
    });
  });

  it('falls back to a plain src when image_urls is null', () => {
    expect(
      responsiveImage('https://cdn.example.com/img', null, '300px')
    ).toEqual({ src: 'https://cdn.example.com/img' });
  });

  it('falls back to a plain src when image_urls is absent', () => {
    expect(
      responsiveImage('https://cdn.example.com/img', undefined, '300px')
    ).toEqual({ src: 'https://cdn.example.com/img' });
  });

  it('returns null without any image', () => {
    expect(responsiveImage(null, null, '300px')).toBeNull();
  });
});
