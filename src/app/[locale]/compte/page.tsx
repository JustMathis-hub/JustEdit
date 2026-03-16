export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { formatPrice, formatDate } from '@/lib/utils';
import { DownloadButton } from '@/components/compte/DownloadButton';
import { User, Package, Calendar, ArrowRight, Gift } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ClaimedFreePackCard } from '@/components/shop/ClaimedFreePackCard';
import { getFreePackBySlug } from '@/lib/freePacksConfig';
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[rgba(139,26,26,0.15)] border border-[rgba(139,26,26,0.2)] flex items-center justify-center">
              <User size={18} className="text-[#8b1a1a]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                {t('welcome', { name: profile?.full_name ?? user.email?.split('@')[0] ?? 'User' })}
              </h1>
              <p className="text-sm text-[oklch(0.45_0.005_0)]">{user.email}</p>
            </div>
          </div>
        </div>

        {/* ── Free packs section ── */}
        {freeClaims && freeClaims.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Gift size={16} className="text-[#8b1a1a]" />
              <h2 className="text-lg font-bold text-white">Packs gratuits</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    downloadUrl={claim.download_url ?? pack.downloadUrl}
                    videoUrl={pack.videoUrl}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Purchases section */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Package size={16} className="text-[#8b1a1a]" />
            <h2 className="text-lg font-bold text-white">{t('purchases')}</h2>
          </div>

          {!purchases || purchases.length === 0 ? (
            <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-2xl p-12 text-center">
              <Package size={32} className="text-[oklch(0.3_0.005_0)] mx-auto mb-3" />
              <p className="text-[oklch(0.5_0.005_0)] mb-5">{t('noOrders')}</p>
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
            <div className="space-y-3">
              {(purchases as (Purchase & { product: Product })[]).map((purchase) => {
                const productName = locale === 'fr'
                  ? purchase.product?.name_fr
                  : purchase.product?.name_en;

                return (
                  <div
                    key={purchase.id}
                    className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    {/* Product thumbnail */}
                    <div className="w-16 h-10 rounded-lg bg-[oklch(0.09_0_0)] border border-[oklch(0.18_0_0)] shrink-0 overflow-hidden">
                      {purchase.product?.thumbnail_url ? (
                        <img
                          src={purchase.product.thumbnail_url}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-[oklch(0.3_0.005_0)]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{productName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[oklch(0.45_0.005_0)] flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(purchase.created_at, locale)}
                        </span>
                        <span className="text-xs font-semibold text-[oklch(0.6_0.005_0)]">
                          {formatPrice(purchase.amount_paid_cents, locale)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.2)]">
                          {t(`status.${purchase.status}`)}
                        </span>
                      </div>
                    </div>

                    {/* Download */}
                    <DownloadButton purchaseId={purchase.id} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

