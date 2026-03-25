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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { amount_cents, note } = body as { amount_cents: number; note?: string };

  if (!amount_cents || amount_cents <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: affiliate } = await db
    .from('affiliates')
    .select('id, stripe_connect_account_id, total_earned_cents, total_paid_cents')
    .eq('id', id)
    .single();

  if (!affiliate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const balance = affiliate.total_earned_cents - affiliate.total_paid_cents;
  if (amount_cents > balance) {
    return NextResponse.json({ error: 'Montant superieur au solde disponible' }, { status: 400 });
  }

  let stripeTransferId: string | null = null;
  let payoutMethod: 'stripe' | 'bank_transfer' = 'bank_transfer';

  if (affiliate.stripe_connect_account_id) {
    // Verify account is ready for transfers
    const account = await stripe.accounts.retrieve(affiliate.stripe_connect_account_id);
    if (!account.payouts_enabled) {
      return NextResponse.json({ error: 'Le compte Stripe Connect n\'est pas encore actif. Val doit finaliser son onboarding.' }, { status: 400 });
    }

    const transfer = await stripe.transfers.create({
      amount: amount_cents,
      currency: 'eur',
      destination: affiliate.stripe_connect_account_id,
      description: note ?? `Commission JustEdit — ${new Date().toLocaleDateString('fr-FR')}`,
    });

    stripeTransferId = transfer.id;
    payoutMethod = 'stripe';
  }

  // Record the payout
  await db.from('affiliate_payouts').insert({
    affiliate_id: id,
    amount_cents,
    payout_method: payoutMethod,
    stripe_transfer_id: stripeTransferId,
    reference: stripeTransferId,
    notes: note ?? null,
  });

  // Update affiliate totals
  await db.rpc('increment_affiliate_paid', {
    p_affiliate_id: id,
    p_amount: amount_cents,
  });

  // Mark oldest pending/approved commissions as paid
  const { data: pendingCommissions } = await db
    .from('affiliate_commissions')
    .select('id, commission_cents')
    .eq('affiliate_id', id)
    .in('status', ['pending', 'approved'])
    .order('created_at', { ascending: true });

  let remaining = amount_cents;
  for (const c of pendingCommissions ?? []) {
    if (remaining <= 0) break;
    if (c.commission_cents <= remaining) {
      await db.from('affiliate_commissions').update({ status: 'paid' }).eq('id', c.id);
      remaining -= c.commission_cents;
    }
  }

  return NextResponse.json({
    success: true,
    via_stripe: !!stripeTransferId,
    stripe_transfer_id: stripeTransferId,
  });
}
