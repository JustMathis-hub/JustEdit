import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { affiliateClickRatelimit, getIp, safeLimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getIp(request);
    const { success: rlOk } = await safeLimit(affiliateClickRatelimit, ip);
    if (!rlOk) {
      return NextResponse.json({ ok: true }); // silent — don't reveal rate limit to bots
    }

    const { code, landingPage } = await request.json();
    if (!code || typeof code !== 'string' || code.length > 50) {
      return NextResponse.json({ ok: true }); // silent
    }

    const supabase = createAdminClient();

    // Find active affiliate by code
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('code', code)
      .eq('status', 'active')
      .single();

    if (!affiliate) {
      return NextResponse.json({ ok: true }); // silent — invalid code
    }

    // Record click
    await supabase.from('referral_clicks').insert({
      affiliate_id: affiliate.id,
      ip_address: getIp(request),
      user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
      landing_page: typeof landingPage === 'string' ? landingPage.slice(0, 500) : null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail visibly
  }
}
