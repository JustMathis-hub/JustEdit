import { redirect } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { formatPrice, formatDate } from '@/lib/utils';
import { DownloadButton } from '@/components/compte/DownloadButton';
import { User, Package, Calendar, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
                <Button className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0">
                  {t('shopCta')} <ArrowRight size={14} className="ml-1.5" />
                </Button>
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
