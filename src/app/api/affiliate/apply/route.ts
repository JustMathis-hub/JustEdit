import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateCode(name: string): string {
  const base = name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || 'AFF'}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payoutMethod, payoutDetails } = await request.json();

    // Validate payout method
    if (payoutMethod && !['paypal', 'bank_transfer'].includes(payoutMethod)) {
      return NextResponse.json({ error: 'Invalid payout method' }, { status: 400 });
    }

    // Check if already an affiliate
    const { data: existing } = await supabase
      .from('affiliates')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({
        error: existing.status === 'rejected' ? 'Application was rejected' : 'Already applied',
        status: existing.status,
      }, { status: 409 });
    }

    // Get profile name for code generation
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const code = generateCode(profile?.full_name ?? user.email?.split('@')[0] ?? 'user');

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .insert({
        user_id: user.id,
        code,
        payout_method: payoutMethod ?? null,
        payout_details: payoutDetails ?? null,
      })
      .select('id, code, status')
      .single();

    if (error) {
      console.error('[affiliate/apply]', error);
      return NextResponse.json({ error: 'Failed to apply' }, { status: 500 });
    }

    return NextResponse.json(affiliate);
  } catch (err) {
    console.error('[affiliate/apply]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
