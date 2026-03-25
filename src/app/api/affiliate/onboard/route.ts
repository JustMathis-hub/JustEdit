import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';

// GET — Génère un lien d'onboarding Stripe frais et redirige l'affilié
// Accessible à l'affilié connecté (pas besoin d'être admin)
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/fr/auth/connexion', request.url));
  }

  const db = createAdminClient();

  const { data: affiliate } = await db
    .from('affiliates')
    .select('id, stripe_connect_account_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!affiliate?.stripe_connect_account_id) {
    return NextResponse.redirect(new URL('/fr/compte/affiliate', request.url));
  }

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://justedit.store';
    const accountLink = await stripe.accountLinks.create({
      account: affiliate.stripe_connect_account_id,
      refresh_url: `${origin}/api/affiliate/onboard`,
      return_url: `${origin}/fr/compte/affiliate?stripe_connected=1`,
      type: 'account_onboarding',
    });

    return NextResponse.redirect(accountLink.url);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe';
    console.error('[affiliate/onboard]', message);
    return NextResponse.redirect(new URL('/fr/compte/affiliate?stripe_error=1', request.url));
  }
}
