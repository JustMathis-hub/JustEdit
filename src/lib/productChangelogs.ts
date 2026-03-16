export interface ChangelogEntry {
  version: string;
  label: string; // e.g. "Just Number V1"
  date?: string; // optional display date
  items: string[];
  upcoming?: boolean;
}

export const PRODUCT_CHANGELOGS: Record<string, ChangelogEntry[]> = {
  'just-number': [
    {
      version: 'v1',
      label: 'Just Number V1',
      date: 'Mars 2026',
      items: [
        '+15 animations d\'apparitions',
        '+2 types de textures (métal, nuage)',
        'Number format',
        'Suffixe / Préfixe',
        'Glow + Lights',
        'Gradient Style',
        'Modifier les ombres',
      ],
    },
  ],
};
