import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType;

  // Detect locale from Accept-Language header, default to French
  const acceptLang = request.headers.get('accept-language') ?? '';
  const locale = acceptLang.toLowerCase().startsWith('en') ? 'en' : 'fr';

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      const redirectPath = type === 'recovery'
        ? `/${locale}/auth/reset-password`
        : `/${locale}/compte`;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/auth/connexion?error=auth_callback_error`);
}
