import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { profileRatelimit, getIp } from '@/lib/ratelimit';

const MAX_NAME = 100;

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (profileRatelimit) {
      const ip = getIp(req);
      const { success } = await profileRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
      }
    }

    const { full_name, avatar_url } = await req.json();

    // Input validation
    if (full_name !== undefined && full_name !== null) {
      if (typeof full_name !== 'string' || full_name.trim().length > MAX_NAME) {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
      }
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: full_name?.trim() || null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Sync auth user metadata
    await supabase.auth.updateUser({
      data: { full_name: full_name?.trim() || null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
