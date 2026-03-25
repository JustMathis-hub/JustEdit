export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ProfileEditor } from '@/components/compte/ProfileEditor';
import { PurchasedProductCard } from '@/components/compte/PurchasedProductCard';
import { ArrowRight, Package } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ClaimedFreePackCard } from '@/components/shop/ClaimedFreePackCard';
import { getFreePackBySlug } from '@/lib/freePacksConfig';
import { PRODUCT_THUMBNAILS } from '@/lib/productMediaConfig';
import type { Purchase, Product } from '@/types';

export default async function AccountPage() {
  const t = await getTranslations('account');
  const locale = await getLocale();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/connexion`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, code')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, product:products(*)')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  const { data: freeClaims } = await supabase
    .from('free_claims')
    .select('pack_slug, download_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const memberSince = new Date(user.created_at).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const purchaseCount = (purchases?.length ?? 0) + (freeClaims?.length ?? 0);

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-[oklch(0.07_0_0)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b1a1a] to-transparent opacity-60" />
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.8) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-8 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.6) 0%, transparent 65%)' }} />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(oklch(0.95 0.005 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.95 0.005 0) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-10">

        {/* ── Profile banner ── */}
        <div data-reveal className="je-profile-card rounded-2xl p-5 sm:p-6 border border-[oklch(0.18_0.01_0)] bg-[oklch(0.10_0_0)]">
          <ProfileEditor
            profile={profile}
            email={user.email ?? ''}
            memberSince={memberSince}
            purchaseCount={purchaseCount}
          />
        </div>

        {/* ── Affiliate dashboard ── */}
        {affiliate && (
          <div data-reveal>
            <Link href="/compte/affiliate">
              <div className="group flex items-center justify-between bg-[oklch(0.10_0_0)] border border-[rgba(139,26,26,0.3)] rounded-2xl p-5 hover:border-[rgba(139,26,26,0.6)] hover:bg-[oklch(0.12_0_0)] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[rgba(139,26,26,0.15)] border border-[rgba(139,26,26,0.25)] flex items-center justify-center">
                    <ArrowRight size={16} className="text-[#e07070]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Programme Affiliation</p>
                    <p className="text-xs text-[oklch(0.45_0.005_0)]">Code : {affiliate.code}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[oklch(0.4_0_0)] group-hover:text-[#e07070] transition-colors" />
              </div>
            </Link>
          </div>
        )}

        {/* ── Free packs ── */}
        {freeClaims && freeClaims.length > 0 && (
          <section data-reveal>
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(139,26,26,0.18)] border border-[rgba(139,26,26,0.35)] shadow-[0_0_12px_rgba(139,26,26,0.2)]">
                <h2 className="text-[11px] font-black text-[#e07070] uppercase tracking-[0.18em]">
                  {t('freePacks')}
                </h2>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {freeClaims.map((claim) => {
                const pack = getFreePackBySlug(claim.pack_slug);
                if (!pack) return null;
                const packName = locale === 'fr' ? pack.name_fr : pack.name_en;
                return (
                  <ClaimedFreePackCard
                    key={claim.pack_slug}
                    title={packName}
                    slug={claim.pack_slug}
                    locale={locale}
                    downloadUrl={pack.downloadUrl ?? claim.download_url}
                    videoUrl={pack.videoUrl}
                    thumbnailUrl={pack.videoThumbnail}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ── Purchases ── */}
        <section data-reveal>
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(139,26,26,0.18)] border border-[rgba(139,26,26,0.35)] shadow-[0_0_12px_rgba(139,26,26,0.2)]">
              <h2 className="text-[11px] font-black text-[#e07070] uppercase tracking-[0.18em]">
                {t('purchases')}
              </h2>
            </span>
          </div>

          {!purchases || purchases.length === 0 ? (
            <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.17_0_0)] rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[oklch(0.13_0_0)] border border-[oklch(0.20_0_0)] flex items-center justify-center mx-auto mb-4">
                <Package size={20} className="text-[oklch(0.35_0.005_0)]" />
              </div>
              <p className="text-[oklch(0.5_0.005_0)] mb-6 text-sm">{t('noOrders')}</p>
              <Link href="/boutique">
                <button type="button" className="je-card-btn">
                  <span className="je-card-blob" />
                  <span className="je-card-inner">
                    {t('shopCta')} <ArrowRight size={14} />
                  </span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(purchases as (Purchase & { product: Product })[]).map((purchase) => {
                const productName = locale === 'fr'
                  ? purchase.product?.name_fr
                  : purchase.product?.name_en;
                const productSlug = purchase.product?.slug ?? '';
                const productHref = `/${locale}/boutique/${productSlug}`;
                const thumbnail = purchase.product?.thumbnail_url
                  ?? PRODUCT_THUMBNAILS[productSlug]?.[0];

                return (
                  <PurchasedProductCard
                    key={purchase.id}
                    purchaseId={purchase.id}
                    productName={productName ?? ''}
                    productHref={productHref}
                    thumbnailUrl={thumbnail}
                    videoUrl={purchase.product?.preview_video_url ?? undefined}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

    </div>
  );
}
