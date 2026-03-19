export interface ChangelogEntry {
  version: string;
  label: string;
  date?: string; // ISO date string e.g. '2026-03-01'
  items: string[];
  items_en?: string[];
  upcoming?: boolean;
}

export const PRODUCT_CHANGELOGS: Record<string, ChangelogEntry[]> = {
  'just-number': [
    {
      version: 'v1',
      label: 'Just Number V1',
      date: '2026-03-01',
      items: [
        '+15 animations d\'apparitions',
        '+2 types de textures (métal, nuage)',
        'Number format',
        'Suffixe / Préfixe',
        'Glow + Lights',
        'Gradient Style',
        'Modifier les ombres',
      ],
      items_en: [
        '+15 entrance animations',
        '+2 texture types (metal, cloud)',
        'Number format',
        'Suffix / Prefix',
        'Glow + Lights',
        'Gradient Style',
        'Shadow control',
      ],
    },
  ],
};
