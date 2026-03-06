import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { BuyNowButton } from '@/components/shop/BuyNowButton';
import { Badge } from '@/components/ui/badge';
import { Check, Film, FileArchive, Monitor, ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';
import type { Product } from '@/types';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('name_fr, name_en, description_fr, description_en').eq('slug', slug).single();
  if (!data) return {};
  return {
    title: locale === 'fr' ? data.name_fr : data.name_en,
    description: locale === 'fr' ? data.description_fr.slice(0, 160) : data.description_en.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations('product');
  const tShop = await getTranslations('shop');

  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!product) notFound();

  // Check if user already owns this
  const { data: { user } } = await supabase.auth.getUser();
  let purchase = null;
  if (user) {
    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('status', 'completed')
      .single();
    purchase = data;
  }

  const name = locale === 'fr' ? product.name_fr : product.name_en;
  const description = locale === 'fr' ? product.description_fr : product.description_en;
  const price = product.is_free ? tShop('free') : formatPrice(product.price_cents, locale);

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Hero product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-10">
          {/* Left — Preview */}
          <div>
            <div className="aspect-video bg-[oklch(0.09_0_0)] rounded-2xl border border-[oklch(0.18_0_0)] overflow-hidden relative">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film size={48} className="text-[oklch(0.25_0.005_0)]" />
                </div>
              )}
              {product.preview_video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {product.software_tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 text-xs font-medium bg-[oklch(0.13_0_0)] border border-[oklch(0.2_0_0)] rounded-full text-[oklch(0.6_0.005_0)]">
                  {tag}
                </span>
              ))}
              <span className="px-3 py-1 text-xs font-medium bg-[oklch(0.13_0_0)] border border-[oklch(0.2_0_0)] rounded-full text-[oklch(0.6_0.005_0)]">
                .mogrt
              </span>
            </div>
          </div>

          {/* Right — Info + Buy */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest">
                {product.category.toUpperCase()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              {name}
            </h1>

            <p className="text-[oklch(0.55_0.005_0)] leading-relaxed mb-8 text-sm">
              {description}
            </p>

            {/* What's included */}
            <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5 mb-6">
              <p className="text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-widest mb-3">
                {t('includes')}
              </p>
              <ul className="space-y-2">
                {[
                  'Fichier .mogrt',
                  'Compatible After Effects 2022+',
                  'Compatible Premiere Pro 2022+',
                  'Licence commerciale incluse',
                  'Mises à jour gratuites',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[oklch(0.7_0.005_0)]">
                    <Check size={14} className="text-[#8b1a1a] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price + CTA */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black text-white">{price}</span>
                {!product.is_free && (
                  <span className="text-sm text-[oklch(0.45_0.005_0)]">TTC</span>
                )}
              </div>

              <BuyNowButton
                productId={product.id}
                productSlug={product.slug}
                isFree={product.is_free}
                alreadyPurchased={!!purchase}
                purchaseId={purchase?.id}
                label={
                  purchase
                    ? t('alreadyPurchased')
                    : product.is_free
                    ? t('claimFree')
                    : t('buyNow', { price })
                }
              />
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-black text-white tracking-tight mb-6">{t('faq.title')}</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-white font-medium text-sm list-none">
                  {faq.q}
                  <ChevronDown size={16} className="text-[oklch(0.4_0.005_0)] group-open:rotate-180 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-4 text-sm text-[oklch(0.55_0.005_0)] leading-relaxed border-t border-[oklch(0.15_0_0)] pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
