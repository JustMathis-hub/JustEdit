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
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_free', false)
    .order('sort_order', { ascending: true });

  const { data: freePacks } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_free', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {!products || products.length === 0 ? (
          <div className="text-center py-20 text-[oklch(0.4_0.005_0)]">
            {t('noProducts')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {(products as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Free packs section */}
      {freePacks && freePacks.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
          <div className="border-t border-[oklch(0.15_0_0)] pt-14">
            <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">Gratuit</p>
            <h2 className="text-2xl font-black text-white tracking-tight mb-8">
              Packs gratuits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(freePacks as Product[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
