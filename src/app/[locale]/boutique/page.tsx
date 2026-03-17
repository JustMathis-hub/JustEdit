export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Product } from '@/types';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('shop');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function ShopPage() {
  const t = await getTranslations('shop');

  const supabase = await createClient();
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_free', false)
    .order('sort_order', { ascending: true });

  if (productsError) console.error('[Boutique] products error:', JSON.stringify(productsError));

  // Fetch like counts grouped by product_id
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

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <div data-reveal className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="relative">
          <div
            className="absolute -top-10 left-0 w-64 h-64 opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.8) 0%, transparent 70%)' }}
          />
          <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">
            JustEdit
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
            {t('title')}
          </h1>
          <p className="text-[oklch(0.5_0.005_0)]">{t('subtitle')}</p>
        </div>
      </div>

      {/* Paid products */}
      <div data-reveal className="max-w-7xl mx-auto px-4 sm:px-6">
        {!products || products.length === 0 ? (
          <div className="text-center py-20 text-[oklch(0.4_0.005_0)]">
            {t('noProducts')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {(products as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} likeCount={likeCountMap[product.id] ?? 0} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
