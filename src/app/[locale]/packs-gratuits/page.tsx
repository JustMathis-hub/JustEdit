export const dynamic = 'force-dynamic';

import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { FreePackCard } from '@/components/shop/FreePackCard';
import { getFreePackBySlug } from '@/lib/freePacksConfig';
import type { Product } from '@/types';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('freePacks');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function FreePacksPage() {
  const t = await getTranslations('freePacks');
  const locale = await getLocale();

  const supabase = await createClient();

  /* Current user */
  const { data: { user } } = await supabase.auth.getUser();
  const userName: string =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    '';

  const { data: freePacks } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_free', true)
    .neq('slug', '11-backgrounds-animes')
    .order('sort_order', { ascending: true });

  /* ── Like count for the hardcoded "11 Backgrounds Animés" pack ── */
  const { data: bgProduct } = await supabase
    .from('products')
    .select('id')
    .eq('slug', '11-backgrounds-animes')
    .maybeSingle();

  let bgLikeCount = 0;
  if (bgProduct) {
    const { count } = await supabase
      .from('product_likes')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', bgProduct.id);
    bgLikeCount = count ?? 0;
  }

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-[oklch(0.07_0_0)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b1a1a] to-transparent opacity-60" />
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.7) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.6) 0%, transparent 65%)' }} />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(oklch(0.95 0.005 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.95 0.005 0) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div data-reveal className="mb-12">
          <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">
            JustEdit
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
            {t('title')}
          </h1>
          <p className="text-[oklch(0.5_0.005_0)]">{t('subtitle')}</p>
        </div>

        {/* Products grid */}
        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ── Free pack — 11 Backgrounds ── */}
          {(() => { const bg = getFreePackBySlug('11-backgrounds-animes')!; return (
          <FreePackCard
            title={locale === 'fr' ? bg.name_fr : bg.name_en}
            description={locale === 'fr' ? bg.description_fr : bg.description_en}
            itemCount={bg.itemCount}
            itemLabel="backgrounds"
            tags={bg.tags}
            videoUrl={bg.videoUrl}
            thumbnailUrl={bg.videoThumbnail}
            slug={bg.slug}
            locale={locale}
            isAuthenticated={!!user}
            userName={userName}
            productId={bgProduct?.id}
            initialLikeCount={bgLikeCount}
          />); })()}

          {/* ── Supabase free packs ── */}
          {freePacks && (freePacks as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

        </div>
      </div>
    </div>
  );
}
