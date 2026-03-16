import { notFound } from 'next/navigation';
import { ParticlesBg } from '@/components/ui/ParticlesBg';
import { createClient } from '@/lib/supabase/server';
import { getFreePackBySlug } from '@/lib/freePacksConfig';
import { FreeClaimButton } from '@/components/shop/FreeClaimButton';
import { FreePackMediaGallery } from '@/components/shop/FreePackMediaGallery';
import { Check, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const pack = getFreePackBySlug(slug);
  if (!pack) return {};
  return {
    title: locale === 'fr' ? pack.name_fr : pack.name_en,
    description: locale === 'fr' ? pack.description_fr : pack.description_en,
  };
}

export default async function FreePackPage({ params }: Props) {
  const { slug, locale } = await params;

  const pack = getFreePackBySlug(slug);
  if (!pack) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name = locale === 'fr' ? pack.name_fr : pack.name_en;
  const description = locale === 'fr' ? pack.description_fr : pack.description_en;
  const includes = locale === 'fr' ? pack.includes_fr : pack.includes_en;

  /* Check if user already claimed this pack */
  let alreadyClaimed = false;
  let existingDownloadUrl: string | undefined;

  if (user) {
    const { data: claim } = await supabase
      .from('free_claims')
      .select('id, download_url')
      .eq('user_id', user.id)
      .eq('pack_slug', slug)
      .maybeSingle();

    if (claim) {
      alreadyClaimed = true;
      existingDownloadUrl = claim.download_url ?? pack.downloadUrl;
    }
  }

  const loginHref = `/${locale}/auth/connexion?redirect=/${locale}/packs-gratuits/${slug}`;
  const backHref = `/${locale}/packs-gratuits`;

  return (
    <div className="min-h-screen pt-20 pb-24 relative overflow-hidden">

      {/* ── Background ── */}
      <ParticlesBg />

      {/* Top bordeaux glow */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,26,26,0.35) 0%, rgba(139,26,26,0.08) 45%, transparent 70%)' }}
      />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        style={{ background: 'linear-gradient(to top, rgba(8,8,10,0.95), transparent)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── Back link ── */}
        <div className="mt-8 mb-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm transition-colors no-underline text-[oklch(0.38_0.005_0)] hover:text-[oklch(0.6_0.005_0)]"
          >
            <ArrowLeft size={14} />
            Packs gratuits
          </Link>
        </div>

        {/* ══════════════════════════════════════
            MEDIA GALLERY — full width, centered
            ══════════════════════════════════════ */}
        <div className="w-full max-w-4xl mx-auto mb-14">
          <FreePackMediaGallery
            videoUrl={pack.videoUrl}
            title={name}
            slideCount={5}
          />
        </div>

        {/* ══════════════════════════════════════
            PRODUCT INFO — centered below gallery
            ══════════════════════════════════════ */}
        <div className="max-w-3xl mx-auto">

          {/* Badges row */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={11} className="text-white" />
              <span className="text-[11px] font-black text-white uppercase tracking-widest">Gratuit</span>
            </div>
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'oklch(0.45 0.08 15)' }}
            >
              {pack.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {name}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: 'oklch(0.5 0.005 0)' }}>
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {pack.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full"
                style={{
                  background: 'oklch(0.12 0 0)',
                  border: '1px solid oklch(0.2 0 0)',
                  color: 'oklch(0.5 0.005 0)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div
            className="mb-10 h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, oklch(0.18 0 0) 30%, oklch(0.18 0 0) 70%, transparent)' }}
          />

          {/* ── Bottom grid: includes + CTA ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Ce pack contient */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'oklch(0.095 0 0)',
                border: '1px solid oklch(0.16 0 0)',
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-5"
                style={{ color: 'oklch(0.35 0.005 0)' }}
              >
                Ce pack contient
              </p>
              <ul className="space-y-3">
                {includes.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'oklch(0.72 0.005 0)' }}>
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(139,26,26,0.15)',
                        border: '1px solid rgba(139,26,26,0.3)',
                      }}
                    >
                      <Check size={11} className="text-[#c04040]" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price + CTA */}
            <div className="flex flex-col justify-between gap-6">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'oklch(0.35 0.005 0)' }}
                >
                  Prix
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">0 €</span>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'oklch(0.38 0.005 0)' }}
                  >
                    entièrement gratuit
                  </span>
                </div>
              </div>

              <div>
                <FreeClaimButton
                  packSlug={slug}
                  isAuthenticated={!!user}
                  alreadyClaimed={alreadyClaimed}
                  downloadUrl={existingDownloadUrl}
                  loginHref={loginHref}
                />
                <p
                  className="text-xs text-center mt-3"
                  style={{ color: 'oklch(0.3 0.005 0)' }}
                >
                  Compte gratuit · Accès immédiat · Aucune carte requise
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
