import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { DownloadButton } from '@/components/compte/DownloadButton';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const t = await getTranslations('checkout.success');
  const locale = await getLocale();
  const { session_id } = await searchParams;

  const supabase = await createClient();
  let purchase = null;

  if (session_id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Verify payment directly via Stripe (don't rely on webhook timing)
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const { user_id, product_id } = session.metadata ?? {};

        if (
          session.payment_status === 'paid' &&
          user_id === user.id &&
          product_id
        ) {
          // Upsert the purchase immediately (webhook will also upsert — idempotent)
          const adminClient = createAdminClient();
          await adminClient.from('purchases').upsert(
            {
              user_id,
              product_id,
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent as string,
              amount_paid_cents: session.amount_total ?? 0,
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

      // Now fetch the purchase (guaranteed to exist if payment was valid)
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.8) 0%, transparent 70%)' }}
      />

      <div className="text-center max-w-md relative z-10">
        <div className="w-20 h-20 rounded-full bg-[rgba(139,26,26,0.12)] border border-[rgba(139,26,26,0.25)] flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-[#8b1a1a]" />
        </div>

        <h1 className="text-3xl font-black text-white mb-3">{t('title')}</h1>
        <p className="text-[oklch(0.55_0.005_0)] mb-8">{t('subtitle')}</p>

        {purchase && (
          <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5 mb-6 text-left">
            <p className="text-xs text-[oklch(0.45_0.005_0)] mb-2">{t('yourPurchase')}</p>
            <p className="font-bold text-white">
              {locale === 'fr' ? (purchase.product as any)?.name_fr : (purchase.product as any)?.name_en}
            </p>
            <div className="mt-4">
              <DownloadButton purchaseId={purchase.id} />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/compte">
            <Button className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0">
              {t('goToAccount')} <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </Link>
          <Link href="/boutique">
            <Button variant="outline" className="border-[oklch(0.25_0_0)] text-[oklch(0.65_0.005_0)] hover:text-white bg-transparent">
              {t('goToShop')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
