import { notFound } from 'next/navigation';
import { ParticlesBg } from '@/components/ui/ParticlesBg';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { LicensePurchase } from '@/components/shop/LicensePurchase';
import { ChevronDown } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';
import { PROMO_PRICES } from '@/lib/promoConfig';
import { PRODUCT_CHANGELOGS } from '@/lib/productChangelogs';
import { PRODUCT_EXTRA_VIDEOS, PRODUCT_EXTRA_IMAGES, PRODUCT_YOUTUBE_VIDEOS, PRODUCT_THUMBNAILS } from '@/lib/productMediaConfig';
import { ChangelogAccordion } from '@/components/shop/ChangelogAccordion';
import { ProductMediaGallery } from '@/components/shop/ProductMediaGallery';
import type { Metadata } from 'next';
import type { Product } from '@/types';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://justedit.fr';
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('name_fr, name_en, description_fr, description_en, thumbnail_url, price_cents').eq('slug', slug).single();
  if (!data) return {};
  const title = locale === 'fr' ? data.name_fr : data.name_en;
  const description = (locale === 'fr' ? data.description_fr : data.description_en).slice(0, 160);
  const canonicalUrl = `${siteUrl}/${locale}/boutique/${slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: `${siteUrl}/fr/boutique/${slug}`,
        en: `${siteUrl}/en/boutique/${slug}`,
      },
    },
    openGraph: {
      title: `${title} | JustEdit`,
      description,
      url: canonicalUrl,
      type: 'website',
      images: data.thumbnail_url ? [{ url: data.thumbnail_url, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | JustEdit`,
      description,
      images: data.thumbnail_url ? [data.thumbnail_url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations('product');

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
  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('status', 'completed')
      .single();
    purchase = data;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  const name = locale === 'fr' ? product.name_fr : product.name_en;
  const description = locale === 'fr' ? product.description_fr : product.description_en;

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 relative overflow-hidden">

      {/* ── Interactive particle background ── */}
      <ParticlesBg />

      {/* ── Static background layers ── */}
      {/* Top centre bordeaux glow — strong */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,26,26,0.45) 0%, rgba(139,26,26,0.12) 40%, transparent 70%)' }}
      />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Subtle diagonal scan lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px w-[200%] -left-1/2"
            style={{
              top: `${8 + i * 13}%`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(139,26,26,0.15) 30%, rgba(255,255,255,0.04) 50%, rgba(139,26,26,0.15) 70%, transparent 100%)',
              transform: 'rotate(-6deg)',
            }}
          />
        ))}
      </div>
      {/* Left red glow */}
      <div
        className="pointer-events-none absolute top-24 -left-24 w-96 h-96"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.2) 0%, transparent 70%)' }}
      />
      {/* Right faint glow */}
      <div
        className="pointer-events-none absolute top-40 -right-24 w-72 h-72"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.12) 0%, transparent 70%)' }}
      />
      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.9), transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* ══════════════════════════════════════
            MEDIA GALLERY — full width, centered
            ══════════════════════════════════════ */}
        <div className="w-full max-w-4xl mx-auto mt-10 mb-14">
          <ProductMediaGallery
            videoUrl={product.preview_video_url ?? undefined}
            extraVideos={PRODUCT_EXTRA_VIDEOS[product.slug] ?? []}
            images={PRODUCT_EXTRA_IMAGES[product.slug] ?? []}
            thumbnails={PRODUCT_THUMBNAILS[product.slug] ?? []}
            title={name}
          />
        </div>

        {/* ══════════════════════════════════════
            PRODUCT INFO — centered below gallery
            ══════════════════════════════════════ */}
        <div data-reveal className="max-w-3xl mx-auto">

          {/* Category badge */}
          <div className="mb-2">
            <span className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest">
              {product.category === 'mogrt' ? 'MOGRT' : product.category.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {name}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: 'oklch(0.55 0.005 0)' }}>
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {product.software_tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full"
                style={{
                  background: 'oklch(0.13 0 0)',
                  border: '1px solid oklch(0.2 0 0)',
                  color: 'oklch(0.6 0.005 0)',
                }}
              >
                {tag}
              </span>
            ))}
            <span
              className="px-3 py-1 text-xs font-medium rounded-full"
              style={{
                background: 'oklch(0.13 0 0)',
                border: '1px solid oklch(0.2 0 0)',
                color: 'oklch(0.6 0.005 0)',
              }}
            >
              .mogrt
            </span>
          </div>

          {/* Divider */}
          <div
            className="mb-10 h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, oklch(0.18 0 0) 30%, oklch(0.18 0 0) 70%, transparent)' }}
          />

          {/* ── Purchase card ── */}
          <div className="mb-10">
            <LicensePurchase
              productId={product.id}
              productSlug={product.slug}
              isFree={product.is_free}
              priceCents={PROMO_PRICES[product.slug] ?? product.price_cents}
              originalPriceCents={PROMO_PRICES[product.slug] ? product.price_cents : undefined}
              locale={locale}
              alreadyPurchased={!!purchase}
              purchaseId={purchase?.id}
              isAdmin={isAdmin}
            />
          </div>

          {/* Changelog / Notes de version */}
          {PRODUCT_CHANGELOGS[product.slug] && (
            <div className="mt-4">
              <ChangelogAccordion entries={PRODUCT_CHANGELOGS[product.slug]} />
            </div>
          )}

        </div>

        {/* ── Tutoriel vidéo ── */}
        {PRODUCT_YOUTUBE_VIDEOS[product.slug] && (
          <div data-reveal className="mt-24">
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">{t('tutorialTitle')}</h2>
            <p className="text-sm text-[oklch(0.45_0.005_0)] mb-8">{t('tutorialSubtitle')}</p>
            <div
              className="w-full rounded-2xl overflow-hidden border border-[oklch(0.18_0_0)]"
              style={{ aspectRatio: '16/9' }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${PRODUCT_YOUTUBE_VIDEOS[product.slug]}`}
                title="Tutoriel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* ── Common issues ── */}
        <div data-reveal className="mt-24">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">{t('issuesTitle')}</h2>
          <p className="text-sm text-[oklch(0.45_0.005_0)] mb-12">{t('issuesSubtitle')}</p>

          <div className="space-y-16">

            {/* Issue 1 — slider left */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <BeforeAfterSlider
                beforeSrc="/images/justnumber/pb1-1.png"
                afterSrc="/images/justnumber/pb1-2.png"
                beforeLabel={locale === 'fr' ? 'Activé' : 'Enabled'}
                afterLabel={locale === 'fr' ? 'Pas activé' : 'Disabled'}
              />
              <div>
                <span className="inline-block text-[10px] font-bold text-[#8b1a1a] uppercase tracking-widest mb-3 px-2 py-1 bg-[rgba(139,26,26,0.08)] border border-[rgba(139,26,26,0.2)] rounded-md">Glow</span>
                <h3 className="text-xl font-black text-white tracking-tight mb-3">Glow settings</h3>
                <p className="text-sm text-[oklch(0.5_0.005_0)] leading-relaxed">
                  {locale === 'fr'
                    ? <>Le Glow peut varier selon les paramètres de votre séquence. Si vous cochez l&apos;option &quot;Composite en couleur linéaire&quot; (accessible via Réglages de la séquence &gt; Général &gt; Composite en couleur linéaire), l&apos;effet ne s&apos;affichera pas de la même manière que si la case reste décochée. Choisissez le style qui vous convient le mieux ! Gardez toutefois en tête que, lorsque cette case est activée, des défauts peuvent apparaître sur les contours d&apos;un Glow particulièrement intense.</>
                    : <>The Glow may vary depending on your sequence settings. If you check the &quot;Composite in Linear Color&quot; option (accessible via Sequence Settings &gt; General &gt; Composite in Linear Color), the effect will not appear the same as when the box is unchecked. Choose the style that suits you best! However, keep in mind that when this option is enabled, artifacts may appear on the edges of a particularly intense Glow.</>
                  }
                </p>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-[oklch(0.2_0_0)] to-transparent" />

            {/* Issue 2 — slider right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="order-1 lg:order-2">
                <BeforeAfterSlider
                  beforeSrc="/images/justnumber/pb2-1.png"
                  afterSrc="/images/justnumber/pb2-2.png"
                  beforeLabel={locale === 'fr' ? 'Problème' : 'Issue'}
                  afterLabel="Solution"
                />
              </div>
              <div className="order-2 lg:order-1">
                <span className="inline-block text-[10px] font-bold text-[#8b1a1a] uppercase tracking-widest mb-3 px-2 py-1 bg-[rgba(139,26,26,0.08)] border border-[rgba(139,26,26,0.2)] rounded-md">{locale === 'fr' ? 'Couleur' : 'Color'}</span>
                <h3 className="text-xl font-black text-white tracking-tight mb-3">{locale === 'fr' ? 'Bug Couleur Originale' : 'Original Color Bug'}</h3>
                <p className="text-sm text-[oklch(0.5_0.005_0)] leading-relaxed">
                  {locale === 'fr'
                    ? <>Le Glow peut parfois modifier la couleur originale du texte selon ses paramètres. Le paramètre à changer est : &quot;Glow Threshold&quot;, c&apos;est le curseur qui détermine le niveau de luminosité à partir duquel un objet commence à briller : plus le seuil (Threshold) est élevé, plus il faut que l&apos;image soit lumineuse pour déclencher l&apos;effet de Glow et inversement. Cependant si vous baissez le seuil (Threshold) pour avoir un Glow plus lumineux, cela peut modifier les couleurs originales.</>
                    : <>The Glow can sometimes alter the original text color depending on its settings. The parameter to change is: &quot;Glow Threshold&quot; — this is the slider that determines the brightness level at which an object starts to glow: the higher the threshold (Threshold), the brighter the image needs to be to trigger the Glow effect, and vice versa. However, if you lower the threshold (Threshold) to get a more luminous Glow, it may alter the original colors.</>
                  }
                </p>
              </div>
            </div>


          </div>
        </div>

        {/* FAQ */}
        <div data-reveal className="mt-20">
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
