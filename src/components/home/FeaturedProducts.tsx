import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types';

export async function FeaturedProducts() {
  const t = await getTranslations('home.featured');
  const tShop = await getTranslations('home.cta');

  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_free', false)
    .order('sort_order', { ascending: true })
    .limit(4);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">
              JustEdit
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {t('title')}
            </h2>
            <p className="text-[oklch(0.5_0.005_0)] mt-2 text-sm">{t('subtitle')}</p>
          </div>
          <Link href="/boutique" className="hidden md:flex items-center gap-1.5 text-sm text-[oklch(0.5_0.005_0)] hover:text-white transition-colors">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-block p-px rounded-xl bg-gradient-to-r from-[oklch(0.18_0_0)] via-[#8b1a1a] to-[oklch(0.18_0_0)]">
            <div className="bg-[oklch(0.09_0_0)] rounded-xl px-8 py-6 text-center">
              <p className="text-white font-bold text-lg mb-1">{tShop('title')}</p>
              <p className="text-[oklch(0.5_0.005_0)] text-sm mb-4">{tShop('subtitle')}</p>
              <Link href="/boutique">
                <Button className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0 font-semibold">
                  {tShop('button')} <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
