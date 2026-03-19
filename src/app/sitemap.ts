import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { FREE_PACKS } from '@/lib/freePacksConfig';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://justedit.fr';
  const locales = ['fr', 'en'];
  const now = new Date();

  // Static pages
  const staticPages = [
    '',
    '/boutique',
    '/packs-gratuits',
    '/contact',
    '/faq',
    '/conditions-generales-de-vente',
    '/mentions-legales',
    '/politique-de-confidentialite',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${page}`,
      lastModified: now,
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1.0 : page === '/boutique' ? 0.9 : 0.6,
    }))
  );

  // Dynamic product pages
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_published', true);

  const productEntries: MetadataRoute.Sitemap = (products ?? []).flatMap((product) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/boutique/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  // Free packs pages
  const freePackEntries: MetadataRoute.Sitemap = FREE_PACKS.flatMap((pack) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/packs-gratuits/${pack.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  return [...staticEntries, ...productEntries, ...freePackEntries];
}
