export interface FreePack {
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  tags: string[];
  videoUrl?: string;
  videoThumbnail?: string; // Thumbnail image for the video slide (mobile fallback)
  thumbnailUrl?: string;
  images?: string[]; // Preview screenshots
  includes_fr: string[];
  includes_en: string[];
  downloadUrl?: string;
  itemCount: number;
  category: string;
}

export const FREE_PACKS: FreePack[] = [
  {
    slug: '11-backgrounds-animes',
    name_fr: '11 Backgrounds Animés',
    name_en: '11 Animated Backgrounds',
    description_fr: 'Une collection de 11 fonds animés prêts à l\'emploi pour habiller vos montages. Modernes, épurés, compatibles Premiere Pro.',
    description_en: 'A collection of 11 animated backgrounds ready to use in your edits. Modern, clean, Premiere Pro compatible.',
    tags: ['Premiere Pro', '.mogrt', 'Backgrounds'],
    includes_fr: [
      '11 Backgrounds de haute qualité',
      'Fichier .mp4',
      'Utilisation libre (perso & commercial)',
      'Mises à jour gratuites',
    ],
    includes_en: [
      '11 high-quality backgrounds',
      '.mp4 file',
      'Free to use (personal & commercial)',
      'Free updates',
    ],
    videoUrl: '/videos/video-11backgrounds-free.mp4',
    videoThumbnail: '/images/thumbnails/11-backgrounds-animes/thumb-1.png',
    images: [
      '/images/packs/bg-1.png',
      '/images/packs/bg-2.png',
      '/images/packs/bg-3.png',
    ],
    itemCount: 11,
    category: 'MOGRT',
    downloadUrl: 'https://assets.justedit.store/11-backgrounds-animes.zip',
  },
];

export function getFreePackBySlug(slug: string): FreePack | undefined {
  return FREE_PACKS.find((p) => p.slug === slug);
}
