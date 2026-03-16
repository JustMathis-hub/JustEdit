/**
 * Extra media slides for paid product pages.
 * Add video URLs or image paths per product slug.
 * Files must be placed in /public/.
 */
export const PRODUCT_EXTRA_VIDEOS: Record<string, string[]> = {
  'just-number': [
    '/videos/justnumber/justnumber-2.mp4',
    '/videos/justnumber/justnumber-3.mp4',
    '/videos/justnumber/justnumber-4.mp4',
  ],
};

export const PRODUCT_EXTRA_IMAGES: Record<string, string[]> = {
  // 'just-number': ['/images/products/just-number-1.jpg'],
};
