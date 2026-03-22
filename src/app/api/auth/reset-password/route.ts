import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token_hash, password } = await request.json();

  if (!token_hash || !password || password.length < 8) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const supabase = await createClient();

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash,
    type: 'recovery',
  });

  if (verifyError) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });

  await supabase.auth.signOut();

  if (updateError) {
    return NextResponse.json({ error: 'update_failed' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
