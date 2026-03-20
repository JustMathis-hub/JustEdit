import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { DownloadButton } from '@/components/compte/DownloadButton';
import { Link } from '@/i18n/navigation';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const t = await getTranslations('checkout.success');
  const locale = await getLocale();
  const { session_id } = await searchParams;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let purchase: any = null;
  let amountPaid = 0;

  if (session_id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const { user_id, product_id } = session.metadata ?? {};

        if (
          session.payment_status === 'paid' &&
          user_id === user.id &&
          product_id
        ) {
          amountPaid = session.amount_total ?? 0;

          const adminClient = createAdminClient();
          await adminClient.from('purchases').upsert(
            {
              user_id,
              product_id,
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent as string,
              amount_paid_cents: Math.round(amountPaid),
              currency: session.currency ?? 'eur',
              status: 'completed',
              completed_at: new Date().toISOString(),
            },
            { onConflict: 'stripe_session_id' }
          );
        }
      } catch (err) {
        console.error('[succes] Stripe session fetch error:', err);
      }

      const { data } = await supabase
        .from('purchases')
        .select('id, product:products(name_fr, name_en)')
        .eq('stripe_session_id', session_id)
        .eq('status', 'completed')
        .eq('user_id', user.id)
        .single();
      purchase = data;
    }
  }

  const productName = purchase?.product
    ? (locale === 'fr' ? purchase.product.name_fr : purchase.product.name_en)
    : null;

  const formattedPrice = amountPaid > 0
    ? `${(amountPaid / 100).toFixed(2).replace('.', ',')} €`
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.8) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Main card */}
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-2xl overflow-hidden">
          {/* Header with check icon */}
          <div className="relative px-6 pt-8 pb-6 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(139,26,26,0.2) 0%, rgba(139,26,26,0.08) 100%)',
                border: '1px solid rgba(139,26,26,0.3)',
                boxShadow: '0 0 40px rgba(139,26,26,0.15)',
              }}
            >
              <CheckCircle size={36} className="text-[#8b1a1a]" />
            </div>

            <h1 className="text-2xl font-black text-white mb-1.5">{t('title')}</h1>
            <p className="text-sm text-[oklch(0.5_0.005_0)]">{t('subtitle')}</p>
          </div>

          {/* Divider */}
          <div className="mx-6"><div className="h-px bg-[oklch(0.18_0_0)]" /></div>

          {/* Purchase details */}
          {purchase && productName && (
            <div className="px-6 py-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.4_0.005_0)] mb-3">{t('yourPurchase')}</p>

              <div className="bg-[oklch(0.09_0_0)] border border-[oklch(0.2_0_0)] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,26,26,0.25) 0%, rgba(139,26,26,0.1) 100%)',
                      border: '1px solid rgba(139,26,26,0.25)',
                    }}
                  >
                    <ShoppingBag size={18} className="text-[#c0392b]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{productName}</p>
                    {formattedPrice && (
                      <p className="text-xs text-[oklch(0.45_0.005_0)]">{formattedPrice}</p>
                    )}
                  </div>
                </div>

                {/* Download button */}
                <DownloadButton purchaseId={purchase.id} variant="card" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-6 pt-1 flex flex-col gap-2.5">
            <Link
              href="/compte"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #8b1a1a 0%, #5a1010 100%)',
                border: '1px solid rgba(200,60,60,0.3)',
              }}
            >
              {t('goToAccount')} <ArrowRight size={14} />
            </Link>
            <Link
              href="/boutique"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm text-[oklch(0.55_0.005_0)] hover:text-white bg-[oklch(0.09_0_0)] border border-[oklch(0.2_0_0)] hover:border-[oklch(0.25_0_0)] transition-all duration-200"
            >
              {t('goToShop')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
