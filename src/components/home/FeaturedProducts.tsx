import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { FreePackCard } from '@/components/shop/FreePackCard';
import { getFreePackBySlug } from '@/lib/freePacksConfig';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types';

export async function FeaturedProducts() {
  const t = await getTranslations('home.featured');
  const tShop = await getTranslations('home.cta');

  const locale = await getLocale();
  const supabase = await createClient();
  const [{ data: products }, { data: { user } }] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_published', true)
      .eq('is_free', false)
      .order('sort_order', { ascending: true })
      .limit(4),
    supabase.auth.getUser(),
  ]);
  const isAuthenticated = !!user;
  const userName: string =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    '';

  if (!products || products.length === 0) {
    return null;
  }

  // Fetch like counts for paid products
  const productIds = (products ?? []).map((p) => p.id);
  const likeCountMap: Record<string, number> = {};
  if (productIds.length > 0) {
    const { data: likeCounts } = await supabase
      .from('product_likes')
      .select('product_id')
      .in('product_id', productIds);

    if (likeCounts) {
      for (const row of likeCounts) {
        likeCountMap[row.product_id] = (likeCountMap[row.product_id] ?? 0) + 1;
      }
    }
  }

  // Fetch like count for the hardcoded free pack
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
    <section className="py-8 sm:py-14 px-4 sm:px-6 relative overflow-hidden">
      {/* Background — grid + glows matching HeroSection */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.032]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.95 0.005 0) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.95 0.005 0) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
          }}
        />
        {/* Top fade — blends from previous section */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[oklch(0.07_0_0)] to-transparent" />
        {/* Bordeaux glow — bottom left */}
        <div
          className="absolute -bottom-20 -left-20 w-[500px] h-[500px] opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.7) 0%, transparent 65%)' }}
        />
        {/* Bordeaux glow — top right */}
        <div
          className="absolute -top-10 right-0 w-[400px] h-[400px] opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.6) 0%, transparent 65%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">
              JustEdit
            </p>
            <h2 className="text-xl sm:text-4xl font-black text-white tracking-tight">
              {t('title')}
            </h2>
            <p className="text-[oklch(0.5_0.005_0)] mt-2 text-sm">{t('subtitle')}</p>
          </div>
          <Link href="/boutique" className="hidden md:flex items-center gap-1.5 text-sm text-[oklch(0.5_0.005_0)] hover:text-white transition-colors">
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} likeCount={likeCountMap[product.id] ?? 0} />
          ))}
        </div>

        <div className="mt-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-xl sm:text-4xl font-black text-white tracking-tight">
                {locale === 'en' ? 'Free packs' : 'Packs gratuits'}
              </h2>
              <p className="text-[oklch(0.5_0.005_0)] mt-2 text-sm">
                {locale === 'en' ? 'Our most downloaded free packs' : 'Nos packs gratuits les plus téléchargés'}
              </p>
            </div>
            <Link href="/packs-gratuits" className="hidden md:flex items-center gap-1.5 text-sm text-[oklch(0.5_0.005_0)] hover:text-white transition-colors">
              {t('viewAllFree')} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
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
              isAuthenticated={isAuthenticated}
              userName={userName}
              productId={bgProduct?.id}
              initialLikeCount={bgLikeCount}
            />); })()}
          </div>

        </div>

        <div className="text-center mt-12">
          <div className="inline-block p-px rounded-xl bg-gradient-to-r from-[oklch(0.18_0_0)] via-[#8b1a1a] to-[oklch(0.18_0_0)]">
            <div className="bg-[oklch(0.09_0_0)] rounded-xl px-8 py-6 text-center">
              <p className="text-white font-bold text-lg mb-1">{tShop('title')}</p>
              <p className="text-[oklch(0.5_0.005_0)] text-sm mb-4">{tShop('subtitle')}</p>
              <Link href="/boutique">
                <button type="button" className="je-card-btn">
                  <span className="je-card-blob" />
                  <span className="je-card-inner">
                    {tShop('button')} <ArrowRight size={14} />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

