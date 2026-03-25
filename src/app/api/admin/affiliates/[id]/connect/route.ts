import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin' ? user : null;
}

// POST — Create Express account + return onboarding URL
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = createAdminClient();

  const { data: affiliate } = await db
    .from('affiliates')
    .select('id, stripe_connect_account_id, profile:profiles(email, full_name)')
    .eq('id', id)
    .single();

  if (!affiliate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const affiliateProfile = affiliate.profile as Record<string, string> | null;
  let accountId: string = affiliate.stripe_connect_account_id;

  try {
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: affiliateProfile?.email ?? undefined,
        capabilities: { transfers: { requested: true } },
        settings: { payouts: { schedule: { interval: 'manual' } } },
      });
      accountId = account.id;

      await db
        .from('affiliates')
        .update({ stripe_connect_account_id: accountId })
        .eq('id', id);
    }

    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/admin/affilies/${id}`,
      return_url: `${origin}/admin/affilies/${id}?stripe_connected=1`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url, account_id: accountId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe';
    console.error('[connect] Stripe error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET — Return Express dashboard link (for already-connected accounts)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = createAdminClient();

  const { data: affiliate } = await db
    .from('affiliates')
    .select('stripe_connect_account_id')
    .eq('id', id)
    .single();

  if (!affiliate?.stripe_connect_account_id) {
    return NextResponse.json({ error: 'No Stripe account' }, { status: 404 });
  }

  const stripeAccount = await stripe.accounts.retrieve(affiliate.stripe_connect_account_id);

  const loginLink = await stripe.accounts.createLoginLink(affiliate.stripe_connect_account_id);

  return NextResponse.json({
    account_id: affiliate.stripe_connect_account_id,
    charges_enabled: stripeAccount.charges_enabled,
    payouts_enabled: stripeAccount.payouts_enabled,
    dashboard_url: loginLink.url,
  });
}
