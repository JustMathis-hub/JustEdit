import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get affiliate record
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, code, commission_rate, status, payout_method, payout_details, total_earned_cents, total_paid_cents, created_at')
      .eq('user_id', user.id)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: 'Not an affiliate' }, { status: 404 });
    }

    // Clicks last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: clicks30d } = await supabase
      .from('referral_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliate.id)
      .gte('created_at', thirtyDaysAgo);

    // Total clicks
    const { count: clicksTotal } = await supabase
      .from('referral_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliate.id);

    // Conversions (commissions count)
    const { count: conversions } = await supabase
      .from('affiliate_commissions')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliate.id);

    // Pending commissions sum
    const { data: pendingRows } = await supabase
      .from('affiliate_commissions')
      .select('commission_cents')
      .eq('affiliate_id', affiliate.id)
      .in('status', ['pending', 'approved']);

    const pendingCents = pendingRows?.reduce((sum, r) => sum + r.commission_cents, 0) ?? 0;

    // Recent commissions (last 20)
    const { data: commissions } = await supabase
      .from('affiliate_commissions')
      .select('id, sale_amount_cents, commission_cents, commission_rate, status, created_at, product:products(name_fr, name_en)')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Payouts
    const { data: payouts } = await supabase
      .from('affiliate_payouts')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      affiliate,
      stats: {
        clicks30d: clicks30d ?? 0,
        clicksTotal: clicksTotal ?? 0,
        conversions: conversions ?? 0,
        conversionRate: clicksTotal ? Math.round(((conversions ?? 0) / clicksTotal) * 100) : 0,
        pendingCents,
        totalEarnedCents: affiliate.total_earned_cents,
        totalPaidCents: affiliate.total_paid_cents,
        balanceCents: affiliate.total_earned_cents - affiliate.total_paid_cents,
      },
      commissions: commissions ?? [],
      payouts: payouts ?? [],
    });
  } catch (err) {
    console.error('[affiliate/stats]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
