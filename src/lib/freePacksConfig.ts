export interface FreePack {
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  tags: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  includes_fr: string[];
  includes_en: string[];
  downloadUrl?: string; // Will be set when file is uploaded to Supabase Storage
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
    itemCount: 11,
    category: 'MOGRT',
    // downloadUrl: 'https://...' // Uncomment and fill when file is ready in Supabase Storage
  },
];

export function getFreePackBySlug(slug: string): FreePack | undefined {
  return FREE_PACKS.find((p) => p.slug === slug);
}
