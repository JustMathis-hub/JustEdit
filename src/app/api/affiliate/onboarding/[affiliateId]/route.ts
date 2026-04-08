import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ affiliateId: string }> }
) {
  const { affiliateId } = await params;
  const db = createAdminClient();

  const { data: affiliate } = await db
    .from('affiliates')
    .select('id, stripe_connect_account_id, status')
    .eq('id', affiliateId)
    .single();

  if (!affiliate || affiliate.status !== 'active') {
    return new NextResponse('Lien invalide.', { status: 404 });
  }

  if (!affiliate.stripe_connect_account_id) {
    return new NextResponse('Compte Stripe non initialisé. Contactez le support.', { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    const accountLink = await stripe.accountLinks.create({
      account: affiliate.stripe_connect_account_id,
      refresh_url: `${origin}/api/affiliate/onboarding/${affiliateId}`,
      return_url: `${origin}/fr/compte/affiliate?stripe_connected=1`,
      type: 'account_onboarding',
    });

    return NextResponse.redirect(accountLink.url);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe';
    console.error('[affiliate onboarding] Stripe error:', message);
    return new NextResponse('Erreur lors de la génération du lien. Réessayez.', { status: 500 });
  }
}
